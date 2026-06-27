import { useState, useRef, useEffect, useCallback } from 'react';
import { createProcessRunner, ProcessRunner } from '@mcp-studio/sdk';
import { mcpLogger } from '@mcp-studio/logger';

export interface RpcLog {
  timestamp: string;
  type: 'request' | 'response' | 'notification';
  id?: number;
  method?: string;
  success?: boolean;
  payload: any;
}

export interface McpServerHookOptions {
  wsUrl?: string;
}

export function useMcpServer(options: McpServerHookOptions = {}) {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connError, setConnError] = useState<string | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [stdoutLogs, setStdoutLogs] = useState<string[]>([]);
  const [stderrLogs, setStderrLogs] = useState<string[]>([]);
  const [rpcLogs, setRpcLogs] = useState<RpcLog[]>([]);

  const runnerRef = useRef<ProcessRunner | null>(null);
  const bufferRef = useRef('');
  const pendingRequestsRef = useRef<Map<number, { resolve: (res: any) => void; reject: (err: any) => void; timestamp: number }>>(new Map());
  const requestIdRef = useRef(1);

  // Send request helper
  const sendRequest = useCallback((method: string, params: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!runnerRef.current || status === 'disconnected') {
        const err = new Error('Process runner is not active');
        mcpLogger.error('system', err.message);
        reject(err);
        return;
      }

      const id = requestIdRef.current++;
      const requestPayload = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      mcpLogger.logRpcRequest(id, method, params);

      setRpcLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          type: 'request',
          method,
          id,
          payload: requestPayload,
        },
      ]);

      pendingRequestsRef.current.set(id, { resolve, reject, timestamp: Date.now() });

      runnerRef.current.write(JSON.stringify(requestPayload)).catch((err) => {
        pendingRequestsRef.current.delete(id);
        mcpLogger.error('system', `Failed to write to stdin: ${err.message}`);
        reject(err);
      });
    });
  }, [status]);

  const handleIncomingLine = useCallback((line: string) => {
    try {
      const payload = JSON.parse(line);

      if (payload.id !== undefined && payload.id !== null) {
        const pending = pendingRequestsRef.current.get(payload.id);
        if (pending) {
          pendingRequestsRef.current.delete(payload.id);
          const duration = Date.now() - pending.timestamp;

          mcpLogger.logRpcResponse(payload.id, duration, payload.result, payload.error);

          setRpcLogs((prev) => [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString(),
              type: 'response',
              id: payload.id,
              success: !payload.error,
              payload,
            },
          ]);

          if (payload.error) {
            pending.reject(payload.error);
          } else {
            pending.resolve(payload.result);
          }
        }
      } else if (payload.method) {
        mcpLogger.logRpcNotification(payload.method, payload.params);
        setRpcLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            type: 'notification',
            method: payload.method,
            payload,
          },
        ]);
      }
    } catch {
      // General non-JSON-RPC stdout output
      setStdoutLogs((prev) => [...prev, line]);
    }
  }, []);

  const connect = useCallback(async (command: string, args: string[], env: Record<string, string> = {}) => {
    setStatus('connecting');
    setConnError(null);
    setTools([]);
    setRpcLogs([]);
    setStdoutLogs([]);
    setStderrLogs([]);

    try {
      mcpLogger.info('system', `Connecting to process: ${command} ${args.join(' ')}`);
      const runner = createProcessRunner(options.wsUrl);
      runnerRef.current = runner;
      bufferRef.current = '';
      pendingRequestsRef.current.clear();
      requestIdRef.current = 1;

      runner.onStdout((chunk) => {
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
        mcpLogger.warn('stderr', chunk);
        setStderrLogs((prev) => [...prev, chunk]);
      });

      runner.onClose((code) => {
        mcpLogger.info('system', `Process exited with code: ${code}`);
        setStatus('disconnected');
        runnerRef.current = null;
      });

      runner.onError((err) => {
        mcpLogger.error('system', `Process runner encountered error: ${err}`);
        setStatus('error');
        setConnError(err);
        runnerRef.current = null;
      });

      await runner.spawn(command, args, env);

      // Perform Handshake
      mcpLogger.info('system', 'Sending initialize request...');
      const initResult = await sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'mcp-studio-react',
          version: '0.1.0',
        },
      });

      mcpLogger.info('system', 'Initialize handshake succeeded');

      // Complete initialize handshake by sending initialized notification
      if (runnerRef.current && status !== 'disconnected') {
        const initializedPayload = {
          jsonrpc: '2.0',
          method: 'notifications/initialized',
        };
        runner.write(JSON.stringify(initializedPayload)).catch((e) => {
          mcpLogger.warn('system', `Failed to send initialized notification: ${e.message}`);
        });
      }

      setStatus('connected');

      // Fetch Tools List
      mcpLogger.info('system', 'Fetching tools list...');
      const listToolsResult = await sendRequest('tools/list');
      setTools(listToolsResult.tools || []);
      mcpLogger.info('system', `Exposed tools loaded: ${listToolsResult.tools?.length || 0}`);
    } catch (err: any) {
      const errMsg = err.message || err.toString();
      mcpLogger.error('system', `Failed to connect: ${errMsg}`);
      setStatus('error');
      setConnError(errMsg);
      if (runnerRef.current) {
        runnerRef.current.kill().catch(() => {});
        runnerRef.current = null;
      }
    }
  }, [options.wsUrl, sendRequest, handleIncomingLine, status]);

  const disconnect = useCallback(async () => {
    mcpLogger.info('system', 'Disconnecting process...');
    if (runnerRef.current) {
      await runnerRef.current.kill().catch(() => {});
      runnerRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const callTool = useCallback(async (name: string, args: Record<string, any>) => {
    mcpLogger.info('system', `Executing tool: ${name}`);
    return sendRequest('tools/call', {
      name,
      arguments: args,
    });
  }, [sendRequest]);

  // Clean up process on unmount
  useEffect(() => {
    return () => {
      if (runnerRef.current) {
        runnerRef.current.kill().catch(() => {});
      }
    };
  }, []);

  const clearLogs = useCallback(() => {
    setRpcLogs([]);
    setStdoutLogs([]);
    setStderrLogs([]);
  }, []);

  return {
    status,
    connError,
    tools,
    stdoutLogs,
    stderrLogs,
    rpcLogs,
    connect,
    disconnect,
    callTool,
    clearLogs,
  };
}
