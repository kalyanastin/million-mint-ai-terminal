import { useState, useEffect, useRef } from 'react';
import { createStore } from 'zustand';
import { 
  Play, 
  Square, 
  Terminal, 
  Plus, 
  Trash2, 
  Activity, 
  CheckCircle2, 
  CircleAlert,
  ChevronRight,
  Database,
  Cpu,
  FileJson,
  FileText,
  AlertCircle
} from 'lucide-react';
import { createProcessRunner, ProcessRunner } from '@mcp-studio/sdk';
import { JsonInspector } from '@mcp-studio/json-inspector';
import { SchemaForm } from '@mcp-studio/schema-form';

// --- Profile Store System ---
interface Profile {
  id: string;
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'postgres-mcp',
    name: 'PostgreSQL Server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost:5432/mydb'],
    env: {},
  },
  {
    id: 'filesystem-mcp',
    name: 'Local Filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', 'C:/Users'],
    env: {},
  },
];

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string;
  addProfile: (profile: Omit<Profile, 'id'>) => void;
  deleteProfile: (id: string) => void;
  selectProfile: (id: string) => void;
}

const profileStore = createStore<ProfileState>((set) => ({
  profiles: DEFAULT_PROFILES,
  activeProfileId: 'postgres-mcp',
  addProfile: (p) => set((state) => {
    const id = `profile-${Date.now()}`;
    return { 
      profiles: [...state.profiles, { ...p, id }],
      activeProfileId: id 
    };
  }),
  deleteProfile: (id) => set((state) => {
    const remaining = state.profiles.filter(p => p.id !== id);
    return {
      profiles: remaining,
      activeProfileId: remaining[0]?.id || ''
    };
  }),
  selectProfile: (id) => set({ activeProfileId: id })
}));

// --- App Component ---
export default function App() {
  // Profiles state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  
  // Spawner states
  const [command, setCommand] = useState('');
  const [argsStr, setArgsStr] = useState('');
  const [envStr, setEnvStr] = useState('');
  const [profileName, setProfileName] = useState('');
  
  // Connection states
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connError, setConnError] = useState<string | null>(null);
  
  // MCP states
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [toolResult, setToolResult] = useState<any | null>(null);
  const [toolRunning, setToolRunning] = useState(false);
  const [toolError, setToolError] = useState<string | null>(null);

  // Timeline Logs states
  const [rpcLogs, setRpcLogs] = useState<any[]>([]);
  const [stdoutLogs, setStdoutLogs] = useState<string[]>([]);
  const [stderrLogs, setStderrLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'rpc' | 'stdout' | 'stderr'>('rpc');
  
  // References
  const runnerRef = useRef<ProcessRunner | null>(null);
  const bufferRef = useRef('');
  const pendingRequestsRef = useRef<Map<number, { resolve: (res: any) => void, reject: (err: any) => void }>>(new Map());
  const requestIdRef = useRef(1);
  const stdoutEndRef = useRef<HTMLDivElement>(null);
  const stderrEndRef = useRef<HTMLDivElement>(null);
  const rpcEndRef = useRef<HTMLDivElement>(null);

  // Sync with Zustand store
  useEffect(() => {
    const unsub = profileStore.subscribe((state) => {
      setProfiles(state.profiles);
      setActiveId(state.activeProfileId);
      
      const active = state.profiles.find(p => p.id === state.activeProfileId);
      if (active) {
        setCommand(active.command);
        setArgsStr(active.args.join(' '));
        setEnvStr(JSON.stringify(active.env, null, 2));
      }
    });

    // Set initial values
    const state = profileStore.getState();
    setProfiles(state.profiles);
    setActiveId(state.activeProfileId);
    const active = state.profiles.find(p => p.id === state.activeProfileId);
    if (active) {
      setCommand(active.command);
      setArgsStr(active.args.join(' '));
      setEnvStr(JSON.stringify(active.env, null, 2));
    }

    return () => unsub();
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (activeTab === 'stdout') {
      stdoutEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTab === 'stderr') {
      stderrEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTab === 'rpc') {
      rpcEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stdoutLogs, stderrLogs, rpcLogs, activeTab]);

  const handleProfileSelect = (id: string) => {
    profileStore.getState().selectProfile(id);
  };

  const handleAddProfile = () => {
    if (!profileName.trim()) return;
    profileStore.getState().addProfile({
      name: profileName,
      command: 'node',
      args: [],
      env: {}
    });
    setProfileName('');
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    profileStore.getState().deleteProfile(id);
  };

  // --- JSON-RPC Client Protocol ---
  const sendRequest = (method: string, params: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!runnerRef.current || status === 'disconnected') {
        reject(new Error('Process runner is not active'));
        return;
      }

      const id = requestIdRef.current++;
      const requestPayload = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      // Add to log trace
      setRpcLogs((prev) => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: 'request',
        method,
        id,
        payload: requestPayload
      }]);

      pendingRequestsRef.current.set(id, { resolve, reject });
      
      runnerRef.current.write(JSON.stringify(requestPayload))
        .catch(err => {
          pendingRequestsRef.current.delete(id);
          reject(err);
        });
    });
  };

  const handleIncomingLine = (line: string) => {
    try {
      const payload = JSON.parse(line);
      
      // Check if it's a response
      if (payload.id !== undefined && payload.id !== null) {
        const pending = pendingRequestsRef.current.get(payload.id);
        if (pending) {
          pendingRequestsRef.current.delete(payload.id);
          
          setRpcLogs((prev) => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            type: 'response',
            id: payload.id,
            success: !payload.error,
            payload
          }]);

          if (payload.error) {
            pending.reject(payload.error);
          } else {
            pending.resolve(payload.result);
          }
        }
      } else if (payload.method) {
        // Notification
        setRpcLogs((prev) => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          type: 'notification',
          method: payload.method,
          payload
        }]);
      }
    } catch {
      // Not valid JSON-RPC, treat as general stdout log
      setStdoutLogs((prev) => [...prev, line]);
    }
  };

  // --- Connection Actions ---
  const handleConnect = async () => {
    setStatus('connecting');
    setConnError(null);
    setTools([]);
    setRpcLogs([]);
    setStdoutLogs([]);
    setStderrLogs([]);
    setSelectedTool(null);
    setToolResult(null);

    const parsedArgs = argsStr.trim().split(/\s+/).filter(Boolean);
    let parsedEnv: Record<string, string> = {};
    try {
      if (envStr.trim()) {
        parsedEnv = JSON.parse(envStr);
      }
    } catch {
      setStatus('error');
      setConnError('Invalid JSON format in environment variables');
      return;
    }

    try {
      const runner = createProcessRunner();
      runnerRef.current = runner;
      bufferRef.current = '';
      pendingRequestsRef.current.clear();
      requestIdRef.current = 1;

      // Handle output streams
      runner.onStdout((chunk) => {
        setStdoutLogs((prev) => [...prev, chunk]);
        
        // Accumulate and parse line-delimited JSON
        bufferRef.current += chunk;
        let pos;
        while ((pos = bufferRef.current.indexOf('\n')) >= 0) {
          const line = bufferRef.current.substring(0, pos).trim();
          bufferRef.current = bufferRef.current.substring(pos + 1);
          if (line) {
            handleIncomingLine(line);
          }
        }
      });

      runner.onStderr((chunk) => {
        setStderrLogs((prev) => [...prev, chunk]);
      });

      runner.onClose((code) => {
        console.log(`Process closed: ${code}`);
        setStatus('disconnected');
        runnerRef.current = null;
      });

      runner.onError((err) => {
        setStatus('error');
        setConnError(err);
        runnerRef.current = null;
      });

      await runner.spawn(command, parsedArgs, parsedEnv);

      // Perform Handshake
      const initResult = await sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'mcp-studio-client',
          version: '0.1.0'
        }
      });

      console.log('Handshake Succeeded:', initResult);
      setStatus('connected');

      // Send list tools command
      const listToolsResult = await sendRequest('tools/list');
      setTools(listToolsResult.tools || []);
    } catch (err: any) {
      setStatus('error');
      setConnError(err.message || err.toString());
      if (runnerRef.current) {
        runnerRef.current.kill();
        runnerRef.current = null;
      }
    }
  };

  const handleDisconnect = async () => {
    if (runnerRef.current) {
      await runnerRef.current.kill();
      runnerRef.current = null;
    }
    setStatus('disconnected');
  };

  // Run selected tool
  const handleRunTool = async (params: Record<string, any>) => {
    if (!selectedTool) return;
    setToolRunning(true);
    setToolResult(null);
    setToolError(null);

    try {
      const res = await sendRequest('tools/call', {
        name: selectedTool.name,
        arguments: params
      });
      setToolResult(res);
    } catch (err: any) {
      setToolError(err.message || JSON.stringify(err));
    } finally {
      setToolRunning(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0C] text-[#F8F9FA] overflow-hidden select-none">
      
      {/* --- Sidebar Profiles Panel --- */}
      <div className="w-64 border-r border-[#2D2F39] bg-[#16161B] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#2D2F39] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="text-[#FF6F43] h-5 w-5" />
            <span className="font-semibold text-sm tracking-wide">MCP Studio</span>
          </div>
          <span className="text-[10px] bg-[#FF6F43]/15 text-[#FF6F43] font-bold px-1.5 py-0.5 rounded uppercase">MVP</span>
        </div>

        {/* Profile Switcher List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 mb-2">Profiles</div>
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProfileSelect(p.id)}
              className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded transition-all text-xs ${
                activeId === p.id 
                  ? 'bg-[#FF6F43]/10 border border-[#FF6F43]/30 text-white font-medium' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Database className={`h-3.5 w-3.5 ${activeId === p.id ? 'text-[#FF6F43]' : 'text-slate-500'}`} />
                <span className="truncate">{p.name}</span>
              </div>
              {profiles.length > 1 && (
                <Trash2 
                  onClick={(e) => handleDeleteProfile(p.id, e)}
                  className="h-3.5 w-3.5 text-slate-600 hover:text-red-400 shrink-0" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Add Profile Section */}
        <div className="p-3 border-t border-[#2D2F39]">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="New Profile..."
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="flex-1 min-w-0 bg-slate-900 border border-[#2D2F39] text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#FF6F43]"
            />
            <button
              onClick={handleAddProfile}
              className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded text-white shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Dashboard Area --- */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* --- Header Controls --- */}
        <div className="h-16 border-b border-[#2D2F39] bg-[#16161B] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`h-2 w-2 rounded-full ${
              status === 'connected' ? 'bg-green-500' :
              status === 'connecting' ? 'bg-amber-500 animate-pulse' :
              status === 'error' ? 'bg-red-500' : 'bg-slate-600'
            }`} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              {status === 'connected' ? 'Connected' :
               status === 'connecting' ? 'Connecting...' :
               status === 'error' ? 'Error' : 'Disconnected'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {status === 'connected' ? (
              <button
                onClick={handleDisconnect}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-1.5 px-4 rounded text-xs flex items-center space-x-2 transition-all"
              >
                <Square className="h-3.5 w-3.5 text-red-500" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={status === 'connecting'}
                className="bg-[#FF6F43] hover:bg-[#E05C33] disabled:bg-orange-800 text-white font-medium py-1.5 px-4 rounded text-xs flex items-center space-x-2 transition-all shadow-md shadow-[#FF6F43]/10"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>{status === 'connecting' ? 'Connecting...' : 'Connect'}</span>
              </button>
            )}
          </div>
        </div>

        {/* --- Workspace Panel Grid --- */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Split Pane: Left (Execution Config or Tools) */}
          <div className="w-1/2 border-r border-[#2D2F39] flex flex-col bg-[#0A0A0C] overflow-hidden">
            {status !== 'connected' ? (
              // Connection settings view
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Process Configuration</h3>
                  <p className="text-xs text-slate-500">Configure parameters for spawning the local process.</p>
                </div>

                {status === 'error' && connError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-xs flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{connError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Command</label>
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      placeholder="npx"
                      className="w-full bg-slate-900 border border-[#2D2F39] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FF6F43]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Arguments</label>
                    <textarea
                      value={argsStr}
                      onChange={(e) => setArgsStr(e.target.value)}
                      placeholder="-y @modelcontextprotocol/server-postgres postgresql://localhost/mydb"
                      rows={3}
                      className="w-full bg-slate-900 border border-[#2D2F39] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FF6F43]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Environment Variables (JSON)</label>
                    <textarea
                      value={envStr}
                      onChange={(e) => setEnvStr(e.target.value)}
                      placeholder='{"DATABASE_URL": "postgresql://localhost:5432/mydb"}'
                      rows={4}
                      className="w-full bg-slate-900 border border-[#2D2F39] rounded font-mono px-3 py-2 text-xs focus:outline-none focus:border-[#FF6F43]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Connected Tools selection view
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[#2D2F39] bg-[#16161B] flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Available Tools</span>
                  <span className="text-xs font-semibold bg-[#2D2F39] text-slate-300 px-2 py-0.5 rounded">{tools.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {tools.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No tools exposed by this server.
                    </div>
                  ) : (
                    tools.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setSelectedTool(t);
                          setToolResult(null);
                          setToolError(null);
                        }}
                        className={`w-full text-left p-3.5 rounded transition-all border ${
                          selectedTool?.name === t.name
                            ? 'bg-[#FF6F43]/10 border-[#FF6F43]/40 text-white'
                            : 'bg-[#16161B] border-[#2D2F39] hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{t.name}</span>
                          <ChevronRight className="h-4 w-4 text-slate-600" />
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{t.description || 'No description provided'}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Split Pane: Right (Execution Workspace) */}
          <div className="w-1/2 flex flex-col bg-[#0A0A0C] overflow-hidden">
            {status !== 'connected' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Activity className="h-12 w-12 text-slate-700 animate-pulse mb-4" />
                <h3 className="text-sm font-semibold mb-1">Interactive Dev Workbench</h3>
                <p className="text-xs text-slate-500 max-w-sm">Connect to a local daemon process command to browse capabilities and execute tools visually.</p>
              </div>
            ) : selectedTool ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Form header */}
                <div className="p-4 border-b border-[#2D2F39] bg-[#16161B] flex flex-col">
                  <span className="text-[10px] text-[#FF6F43] font-bold uppercase tracking-wider">Selected Tool</span>
                  <h2 className="text-base font-bold text-white mt-0.5">{selectedTool.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedTool.description}</p>
                </div>

                {/* Form layout */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  <div>
                    <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-3">Parameters Form</h3>
                    <SchemaForm
                      schema={selectedTool.inputSchema || {}}
                      onSubmit={handleRunTool}
                      isLoading={toolRunning}
                    />
                  </div>

                  {/* Executions Display */}
                  {(toolResult || toolError) && (
                    <div className="border-t border-[#2D2F39] pt-5 space-y-3">
                      <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Execution Output</h3>
                      {toolError ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-xs flex items-start space-x-2 font-mono">
                          <CircleAlert className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{toolError}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1.5 text-xs text-green-400 font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Execution Succeeded</span>
                          </div>
                          <JsonInspector data={toolResult} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Database className="h-10 w-10 text-slate-700 mb-4" />
                <h3 className="text-sm font-semibold mb-1">Select a Tool</h3>
                <p className="text-xs text-slate-500 max-w-sm">Expose the tool input forms by clicking on any of the loaded tool definitions on the left side.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- Tabbed Stream Timeline Drawer (Stdout, Stderr, RPC) --- */}
        <div className="h-64 border-t border-[#2D2F39] bg-[#16161B] flex flex-col shrink-0 overflow-hidden">
          <div className="h-10 px-4 border-b border-[#2D2F39] flex items-center justify-between shrink-0 bg-[#0F0F12]">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('rpc')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center space-x-1.5 transition-all ${
                  activeTab === 'rpc' ? 'bg-[#2D2F39] text-[#FF6F43]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileJson className="h-3.5 w-3.5" />
                <span>RPC Traffic</span>
                {rpcLogs.length > 0 && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1 rounded-full">{rpcLogs.length}</span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('stdout')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center space-x-1.5 transition-all ${
                  activeTab === 'stdout' ? 'bg-[#2D2F39] text-[#FF6F43]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Stdout</span>
                {stdoutLogs.length > 0 && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1 rounded-full">{stdoutLogs.length}</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('stderr')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center space-x-1.5 transition-all ${
                  activeTab === 'stderr' ? 'bg-[#2D2F39] text-[#FF6F43]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Stderr & Logs</span>
                {stderrLogs.length > 0 && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1 rounded-full">{stderrLogs.length}</span>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                setRpcLogs([]);
                setStdoutLogs([]);
                setStderrLogs([]);
              }}
              className="text-[10px] hover:text-slate-200 text-slate-500 font-semibold px-2 py-1 rounded transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 bg-[#0A0A0C]">
            {activeTab === 'rpc' && (
              <div className="space-y-2">
                {rpcLogs.length === 0 ? (
                  <div className="text-slate-600 text-center py-8">No JSON-RPC messages recorded.</div>
                ) : (
                  rpcLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-slate-900 pb-2 space-y-1">
                      <div className="flex items-center space-x-2 text-[10px]">
                        <span className="text-slate-600">{log.timestamp}</span>
                        <span className={`font-bold uppercase ${
                          log.type === 'request' ? 'text-cyan-400' :
                          log.type === 'response' ? (log.success ? 'text-green-400' : 'text-red-400') :
                          'text-amber-400'
                        }`}>
                          {log.type}
                        </span>
                        {log.method && <span className="text-slate-400">[{log.method}]</span>}
                        {log.id && <span className="text-slate-500">ID: {log.id}</span>}
                      </div>
                      <pre className="text-slate-400 text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
                <div ref={rpcEndRef} />
              </div>
            )}

            {activeTab === 'stdout' && (
              <div className="whitespace-pre-wrap leading-relaxed space-y-0.5">
                {stdoutLogs.length === 0 ? (
                  <div className="text-slate-600 text-center py-8">No stdout stream captured.</div>
                ) : (
                  stdoutLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-slate-950/20 py-0.5">{log}</div>
                  ))
                )}
                <div ref={stdoutEndRef} />
              </div>
            )}

            {activeTab === 'stderr' && (
              <div className="text-red-400 whitespace-pre-wrap leading-relaxed space-y-0.5">
                {stderrLogs.length === 0 ? (
                  <div className="text-slate-600 text-center py-8">No stderr / log events capture.</div>
                ) : (
                  stderrLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-slate-950/20 py-0.5">{log}</div>
                  ))
                )}
                <div ref={stderrEndRef} />
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
