#!/usr/bin/env node
import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

switch (command) {
  case 'daemon':
  case 'start':
    startDaemon(args.slice(1));
    break;
  case 'inspect':
    inspectServer(args.slice(1));
    break;
  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}

function showHelp() {
  console.log(`
MCP Studio CLI (v0.1.0)
Professional CLI for Model Context Protocol development.

Usage:
  mcp-studio <command> [options]

Commands:
  daemon, start               Start the WebSocket Runner Daemon for browser connection.
  inspect <cmd> [args...]     Inspect a local MCP server (queries capabilities and tools).
  help                        Show this help details.

Options for daemon:
  --port <number>             Port to run the daemon server on (default: 3001)

Examples:
  mcp-studio start --port 3001
  mcp-studio inspect npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb
`);
}

function startDaemon(subArgs: string[]) {
  let port = 3001;
  const portIdx = subArgs.indexOf('--port');
  if (portIdx !== -1 && subArgs[portIdx + 1]) {
    port = parseInt(subArgs[portIdx + 1], 10);
  }

  const wss = new WebSocketServer({ port });
  console.log(`[MCP Studio CLI Daemon] Server listening on ws://localhost:${port}`);

  wss.on('connection', (ws) => {
    console.log('[MCP Daemon] Client connected');
    let child: any = null;

    ws.on('message', (message) => {
      try {
        const msg = JSON.parse(message.toString());

        switch (msg.type) {
          case 'spawn': {
            if (child) {
              console.log('[MCP Daemon] Killing existing child before spawning a new one');
              child.kill();
            }

            const { command: cmdStr, args: cmdArgs, env } = msg;
            console.log(`[MCP Daemon] Spawning: ${cmdStr} ${cmdArgs.join(' ')}`);

            child = spawn(cmdStr, cmdArgs, {
              shell: process.platform === 'win32',
              env: { ...process.env, ...env },
            });

            child.stdout.on('data', (data: Buffer) => {
              if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: 'stdout', data: data.toString() }));
              }
            });

            child.stderr.on('data', (data: Buffer) => {
              if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: 'stderr', data: data.toString() }));
              }
            });

            child.on('close', (code: number | null) => {
              console.log(`[MCP Daemon] Process exited with code ${code}`);
              if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: 'close', code }));
              }
              child = null;
            });

            child.on('error', (err: Error) => {
              console.error('[MCP Daemon] Process error:', err);
              if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: 'error', message: err.message }));
              }
              child = null;
            });
            break;
          }

          case 'write': {
            if (child && child.stdin && child.stdin.writable) {
              child.stdin.write(msg.data + '\n');
            }
            break;
          }

          case 'kill': {
            if (child) {
              console.log('[MCP Daemon] Killing process per client command');
              child.kill();
              child = null;
            }
            break;
          }
        }
      } catch (err) {
        console.error('[MCP Daemon] Message error:', err);
      }
    });

    ws.on('close', () => {
      console.log('[MCP Daemon] Client disconnected');
      if (child) {
        child.kill();
        child = null;
      }
    });
  });
}

function inspectServer(subArgs: string[]) {
  if (subArgs.length === 0) {
    console.error('Error: Please specify the command to run the MCP server.');
    console.error('Example: mcp-studio inspect npx @modelcontextprotocol/server-postgres');
    process.exit(1);
  }

  const [cmd, ...cmdArgs] = subArgs;
  console.log(`[MCP Studio CLI] Inspecting: ${cmd} ${cmdArgs.join(' ')}`);

  const child = spawn(cmd, cmdArgs, {
    shell: process.platform === 'win32',
  });

  let buffer = '';
  const pendingRequests = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();
  let reqId = 1;

  child.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    let pos;
    while ((pos = buffer.indexOf('\n')) >= 0) {
      const line = buffer.substring(0, pos).trim();
      buffer = buffer.substring(pos + 1);
      if (line) {
        try {
          const payload = JSON.parse(line);
          if (payload.id !== undefined && payload.id !== null) {
            const pending = pendingRequests.get(payload.id);
            if (pending) {
              pendingRequests.delete(payload.id);
              if (payload.error) {
                pending.reject(payload.error);
              } else {
                pending.resolve(payload.result);
              }
            }
          }
        } catch {
          // Ignore general stdout
        }
      }
    }
  });

  child.stderr.on('data', (data) => {
    console.error(`[Server Stderr] ${data.toString().trim()}`);
  });

  child.on('error', (err) => {
    console.error('Failed to start process:', err);
    process.exit(1);
  });

  child.on('close', (code) => {
    console.log(`[Server] Connection closed with code ${code}`);
    process.exit(code || 0);
  });

  const sendRequest = (method: string, params: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      const id = reqId++;
      const payload = { jsonrpc: '2.0', id, method, params };
      pendingRequests.set(id, { resolve, reject });
      child.stdin.write(JSON.stringify(payload) + '\n');
    });
  };

  // Wait for spawn to stabilize then send initialize request
  setTimeout(async () => {
    try {
      console.log('Sending JSON-RPC handshake (initialize)...');
      const initRes = await sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'mcp-studio-cli-inspector', version: '0.1.0' },
      });
      console.log('\n✓ Handshake Succeeded!');
      console.log(`Server Protocol Version: ${initRes.protocolVersion}`);
      console.log(`Server Info: ${JSON.stringify(initRes.serverInfo)}\n`);

      console.log('Querying exposed tools...');
      const toolsRes = await sendRequest('tools/list');
      const tools = toolsRes.tools || [];
      console.log(`✓ Loaded ${tools.length} tool(s):\n`);

      tools.forEach((t: any, idx: number) => {
        console.log(`${idx + 1}. [Tool] Name: ${t.name}`);
        console.log(`   Description: ${t.description || 'N/A'}`);
        console.log(`   Schema parameters: ${JSON.stringify(t.inputSchema || {})}\n`);
      });

      // Cleanup
      child.kill();
      process.exit(0);
    } catch (err) {
      console.error('Inspection failed:', err);
      child.kill();
      process.exit(1);
    }
  }, 1000);
}
