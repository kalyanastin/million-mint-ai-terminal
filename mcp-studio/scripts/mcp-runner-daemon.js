import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

console.log(`[MCP Daemon] Running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('[MCP Daemon] Client connected');
  let child = null;

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());

      switch (msg.type) {
        case 'spawn': {
          if (child) {
            console.log('[MCP Daemon] Killing existing process before spawning new one');
            child.kill();
          }

          const { command, args, env } = msg;
          console.log(`[MCP Daemon] Spawning command: ${command} ${args.join(' ')}`);

          // Windows compatibility requires shell: true for global tools like npx or npm
          const spawnEnv = { ...process.env, ...env };
          child = spawn(command, args, {
            shell: process.platform === 'win32',
            env: spawnEnv,
          });

          child.stdout.on('data', (data) => {
            if (ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'stdout',
                  data: data.toString(),
                })
              );
            }
          });

          child.stderr.on('data', (data) => {
            if (ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'stderr',
                  data: data.toString(),
                })
              );
            }
          });

          child.on('close', (code) => {
            console.log(`[MCP Daemon] Process closed with exit code ${code}`);
            if (ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'close',
                  code: code,
                })
              );
            }
            child = null;
          });

          child.on('error', (err) => {
            console.error('[MCP Daemon] Process error:', err);
            if (ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: err.message,
                })
              );
            }
            child = null;
          });
          break;
        }

        case 'write': {
          if (child && child.stdin && child.stdin.writable) {
            child.stdin.write(msg.data + '\n');
          } else {
            ws.send(
              JSON.stringify({
                type: 'error',
                message: 'Cannot write: process is not running or stdin is closed',
              })
            );
          }
          break;
        }

        case 'kill': {
          if (child) {
            console.log('[MCP Daemon] Killing process per client request');
            child.kill();
            child = null;
          }
          break;
        }

        default:
          console.warn('[MCP Daemon] Unknown message type:', msg.type);
      }
    } catch (err) {
      console.error('[MCP Daemon] Failed to parse message:', err);
    }
  });

  ws.on('close', () => {
    console.log('[MCP Daemon] Client disconnected');
    if (child) {
      console.log('[MCP Daemon] Cleaning up spawned process for disconnected client');
      child.kill();
      child = null;
    }
  });
});
