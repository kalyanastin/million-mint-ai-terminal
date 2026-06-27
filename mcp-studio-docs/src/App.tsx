import { useState } from 'react';
import { 
  BookOpen, 
  Cpu, 
  Terminal, 
  GitBranch, 
  Compass, 
  AlertTriangle, 
  HelpCircle,
  Menu,
  X,
  Search,
  Check,
  Copy
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('intro');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sections: DocSection[] = [
    {
      id: 'intro',
      title: 'Introduction',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">MCP Studio</h1>
            <p className="text-lg text-slate-400">
              The professional open-source development environment, visual playground, and tool inspector for the Model Context Protocol (MCP).
            </p>
          </div>
          
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-orange-200">
            <strong>What is MCP?</strong> Model Context Protocol is an open standard designed by Anthropic and developers to safely connect AI models with local or remote APIs, data sources, and system actions.
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Overview</h2>
            <p className="text-slate-300 leading-relaxed">
              MCP Studio provides developers with a full visual workbench to build, test, and debug their MCP servers. Rather than running terminal commands and manually inspecting JSON-RPC inputs and outputs in agent logs, MCP Studio renders tools as standard schema-driven UI forms, captures stdin/stdout streams, visualizes JSON logs, and executes commands safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Visual Workbench</h3>
              <p className="text-xs text-slate-400">Renders tool argument schemas dynamically into auto-validated HTML forms using standard JSON Schema definitions.</p>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Dual Mode Runner</h3>
              <p className="text-xs text-slate-400">Runs as a native desktop client via Tauri, or connects from any web browser using a secure local WebSocket runner daemon.</p>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-white font-semibold mb-2">JSON-RPC Explorer</h3>
              <p className="text-xs text-slate-400">Provides raw and structured log streams showing request payloads, execution durations, failures, and connection packets.</p>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-white font-semibold mb-2">CLI Diagnostics</h3>
              <p className="text-xs text-slate-400">Includes a companion CLI to test, inspect, list, and debug servers directly from shell consoles without loading the GUI.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'architecture',
      title: 'Architecture',
      icon: Cpu,
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white">System Architecture</h1>
          <p className="text-slate-400">
            MCP Studio is designed around a monorepo containing decoupled, specialized modules built on top of TypeScript, React, and Rust/Tauri.
          </p>

          {/* Diagram Simulation */}
          <div className="p-6 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 overflow-x-auto whitespace-pre">
{`+-------------------------------------------------------------------+
|                            MCP STUDIO                             |
|                                                                   |
|   +-------------------+    +-----------------+    +-----------+   |
|   |   apps/desktop    |    |  apps/desktop   |    |  CLI Tool |   |
|   |  (Tauri Window)   |    | (Browser Web)   |    | (Terminal)|   |
|   +---------+---------+    +--------+--------+    +-----+-----+   |
|             |                       |                   |         |
|             v (Rust Plugins)        v (WebSocket)       |         |
|      [Tauri Shell API]       [daemon (ws://...)]        |         |
|             |                       |                   |         |
+-------------+-----------------------+-------------------+---------+
              |                       |                   |
              +-----------+-----------+                   |
                          | (Stdin/Stdout Streams)        |
                          v                               v
            +-----------------------------------------------+
            |               Local MCP Server                |
            |       (e.g., SQLite, Filesystem, PG)          |
            +-----------------------------------------------+`}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Packages</h2>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#FF6F43]">@mcp-studio/sdk</h4>
                <p className="text-xs text-slate-400">Provides abstract `ProcessRunner` interfaces and specific implementations for Tauri Command APIs and browser-ready WebSocket commands.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#FF6F43]">@mcp-studio/react</h4>
                <p className="text-xs text-slate-400">Exposes custom React hooks (`useMcpServer`) managing asynchronous execution streams, request timelines, and connection cycles.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#FF6F43]">@mcp-studio/cli</h4>
                <p className="text-xs text-slate-400">A command-line executable wrapper containing both the daemon server and instant console inspector utilities.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#FF6F43]">@mcp-studio/logger</h4>
                <p className="text-xs text-slate-400">A unified console logger implementing ANSI colors and structured formats to trace execution flows.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#FF6F43]">@mcp-studio/json-inspector</h4>
                <p className="text-xs text-slate-400">A collapsible, responsive UI component to explore deep nested JSON outputs returned by MCP tool executions.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#FF6F43]">@mcp-studio/schema-form</h4>
                <p className="text-xs text-slate-400">Generates custom UI form inputs dynamically matching standard JSON schemas mapping checkboxes, numbers, strings, and textarea elements.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dev-guide',
      title: 'Development Guide',
      icon: Terminal,
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white">Development Guide</h1>
          <p className="text-slate-400">Follow these steps to run, build, and test MCP Studio locally from source.</p>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Prerequisites</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
              <li>Node.js (v18 or higher)</li>
              <li>pnpm (v8 or higher recommended)</li>
              <li>Rust and Tauri system build dependencies (required only for native building)</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Cloning and Setup</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-t-lg border-t border-r border-l border-slate-800 text-xs">
                <span className="font-mono text-slate-400">Terminal Shell</span>
                <button 
                  onClick={() => copyToClipboard('git clone https://github.com/mcp-studio/mcp-studio.git\ncd mcp-studio\npnpm install', 'setup')}
                  className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                >
                  {copiedId === 'setup' ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedId === 'setup' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-lg text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
{`git clone https://github.com/mcp-studio/mcp-studio.git
cd mcp-studio
pnpm install`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Running the Workbench</h2>
            <p className="text-sm text-slate-300">To start developing, run the concurrently configured developer script. This launches the daemon on port 3001 and the Vite development server:</p>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-t-lg border-t border-r border-l border-slate-800 text-xs">
                <span className="font-mono text-slate-400">Start Dev Command</span>
                <button 
                  onClick={() => copyToClipboard('pnpm dev', 'pnpm-dev')}
                  className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                >
                  {copiedId === 'pnpm-dev' ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedId === 'pnpm-dev' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-lg text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
{`pnpm dev`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Building from Source</h2>
            <p className="text-sm text-slate-300">To build all workspace packages, execute the typescript compilers and bundlers:</p>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-t-lg border-t border-r border-l border-slate-800 text-xs">
                <span className="font-mono text-slate-400">Build Commands</span>
                <button 
                  onClick={() => copyToClipboard('pnpm build\npnpm lint\npnpm typecheck', 'build-all')}
                  className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                >
                  {copiedId === 'build-all' ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedId === 'build-all' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-lg text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
{`pnpm build
pnpm lint
pnpm typecheck`}
              </pre>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contribute',
      title: 'Contribution Guide',
      icon: GitBranch,
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white">Contributing to MCP Studio</h1>
          <p className="text-slate-400">We welcome open-source contributions! Follow these standards to make sure code quality remains high.</p>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Git Standards</h2>
            <p className="text-sm text-slate-300">MCP Studio enforces the <strong>Conventional Commits</strong> specifications for pull request descriptions and commit messages. This automatically powers release notes and semantic version bumping.</p>
            
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono space-y-1.5">
              <div><span className="text-green-400">feat(react):</span> add loading states to tool forms</div>
              <div><span className="text-green-400">fix(cli):</span> resolve process path escaping on windows systems</div>
              <div><span className="text-green-400">docs(core):</span> update architectural diagrams in readme</div>
              <div><span className="text-green-400">chore:</span> bump dependencies to resolve vulnerabilities</div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Commit Workflow</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
              <li>Fork the repository and create your feature branch: <code className="bg-slate-900 px-1 py-0.5 rounded font-mono text-xs">git checkout -b feat/my-new-tool</code></li>
              <li>Write code, update tests where necessary, and run linters.</li>
              <li>Commit your files using conventional styles.</li>
              <li>Push to your branch and submit a Pull Request to the main repository.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'roadmap',
      title: 'Roadmap & Future',
      icon: Compass,
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white">Project Roadmap</h1>
          <p className="text-slate-400">Features planned for the future evolution of MCP Studio.</p>

          <div className="space-y-6">
            <div className="border-l-2 border-[#FF6F43] pl-4 space-y-2">
              <span className="text-xs bg-[#FF6F43]/15 text-[#FF6F43] font-bold px-2 py-0.5 rounded">v0.1.0 (MVP) — Current Release</span>
              <p className="text-sm text-slate-300">Visual form rendering, CLI inspection tool, multi-profile configurations, basic JSON-RPC tracking, WebSocket process daemon runner, collapsible JSON results visualizer.</p>
            </div>

            <div className="border-l-2 border-slate-800 pl-4 space-y-2">
              <span className="text-xs bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded">v0.2.0 (Planned)</span>
              <p className="text-sm text-slate-300">Expose custom resources explorer tabs, prompt execution panel, support custom headers/tokens in remote servers, secure sandbox configurations, full local logs database using SQLite.</p>
            </div>

            <div className="border-l-2 border-slate-800 pl-4 space-y-2">
              <span className="text-xs bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded">v0.3.0 (Planned)</span>
              <p className="text-sm text-slate-300">Expose server logs via visual timelines, support mock JSON-RPC server definitions, multi-server concurrent connections, support remote deployment configuration (Docker, VPS).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'limitations',
      title: 'Known Limitations',
      icon: AlertTriangle,
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white">Known Limitations</h1>
          <p className="text-slate-400">Important technical behaviors to keep in mind when working with MCP Studio.</p>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">WebSocket Daemon Security</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              The WebSocket runner daemon runs locally on port 3001 and spawns shell processes. Ensure that port 3001 is not exposed publicly to the internet, as it has access to run system commands configured by your interface.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Tauri Shell Scopes</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              When using the Tauri desktop application, standard security scopes require you to register commands in the Tauri permissions configuration before the desktop shell API can execute them.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: HelpCircle,
      content: (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h1>
          <p className="text-slate-400">Common questions about the MCP Studio environment.</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Q: How does MCP Studio spawn processes in browser mode?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A: Standard web browsers cannot run shell commands for security. When you launch MCP Studio on a web browser, it connects to a local WebSocket companion daemon run on port 3001, which acts as a bridge to spawn processes, pipe stdout, and write input commands.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Q: Does MCP Studio support remote MCP servers over SSE?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A: Yes, MCP Studio includes support to connect to remote servers exposed via Server-Sent Events (SSE). You can configure endpoints and headers in your connection settings.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Q: Can I use custom environment variables?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A: Yes, you can specify custom environment variables as a JSON dictionary in the connection settings. These variables are loaded when spawning the child process.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSection = sections.find(sec => sec.id === activeTab) || sections[0];

  return (
    <div className="flex h-screen bg-[#0A0A0C] text-[#F8F9FA] overflow-hidden select-none">
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-72 border-r border-[#2D2F39] bg-[#16161B] flex-col shrink-0">
        <div className="p-5 border-b border-[#2D2F39] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Cpu className="text-[#FF6F43] h-6 w-6" />
            <span className="font-bold text-base tracking-wide text-white">MCP Developer Docs</span>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase">v0.1.0</span>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#2D2F39]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-[#2D2F39] rounded pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#FF6F43]"
            />
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-all text-left text-xs ${
                  activeTab === sec.id
                    ? 'bg-[#FF6F43]/10 text-white font-medium border-l-2 border-[#FF6F43]'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${activeTab === sec.id ? 'text-[#FF6F43]' : 'text-slate-500'}`} />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2D2F39] text-center">
          <p className="text-[10px] text-slate-500">Released under MIT License</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-[#16161B] border-b border-[#2D2F39] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Cpu className="text-[#FF6F43] h-5 w-5" />
            <span className="font-bold text-sm tracking-wide text-white">MCP Docs</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-1 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#16161B] border-b border-[#2D2F39] p-4 space-y-2 shrink-0">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveTab(sec.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs text-left ${
                  activeTab === sec.id ? 'bg-[#FF6F43]/10 text-white font-medium' : 'text-slate-400'
                }`}
              >
                <span>{sec.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Document Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-4xl">
          {activeSection.content}
        </div>
      </div>
    </div>
  );
}
