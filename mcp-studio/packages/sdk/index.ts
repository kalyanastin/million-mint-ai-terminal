export interface ProcessRunner {
  spawn(command: string, args: string[], env?: Record<string, string>): Promise<void>;
  write(message: string): Promise<void>;
  kill(): Promise<void>;
  onStdout(callback: (data: string) => void): void;
  onStderr(callback: (data: string) => void): void;
  onClose(callback: (code: number | null) => void): void;
  onError(callback: (error: string) => void): void;
}

export function isTauriEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    // @ts-expect-error - Checking global window internals injected by Tauri
    (window.__TAURI_INTERNALS__ !== undefined || window.__TAURI__ !== undefined)
  );
}

/**
 * Tauri native implementation of ProcessRunner
 */
export class TauriProcessRunner implements ProcessRunner {
  private child: any = null;
  private stdoutCallbacks: ((data: string) => void)[] = [];
  private stderrCallbacks: ((data: string) => void)[] = [];
  private closeCallbacks: ((code: number | null) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];

  async spawn(command: string, args: string[], env: Record<string, string> = {}): Promise<void> {
    try {
      // Dynamic import to prevent loading shell plugin in pure browser mode
      const { Command } = await import('@tauri-apps/plugin-shell');
      
      const cmd = Command.create(command, args, { env });
      
      cmd.stdout.on('data', (line: string) => {
        this.stdoutCallbacks.forEach((cb) => cb(line));
      });

      cmd.stderr.on('data', (line: string) => {
        this.stderrCallbacks.forEach((cb) => cb(line));
      });

      cmd.on('close', (data: any) => {
        this.closeCallbacks.forEach((cb) => cb(data.code));
      });

      cmd.on('error', (err: any) => {
        this.errorCallbacks.forEach((cb) => cb(err.toString()));
      });

      this.child = await cmd.spawn();
    } catch (err: any) {
      const errMsg = err.message || err.toString();
      this.errorCallbacks.forEach((cb) => cb(errMsg));
      throw new Error(`Failed to spawn Tauri process: ${errMsg}`);
    }
  }

  async write(message: string): Promise<void> {
    if (!this.child) {
      throw new Error('Process is not running');
    }
    await this.child.write(message + '\n');
  }

  async kill(): Promise<void> {
    if (this.child) {
      await this.child.kill();
      this.child = null;
    }
  }

  onStdout(callback: (data: string) => void): void {
    this.stdoutCallbacks.push(callback);
  }

  onStderr(callback: (data: string) => void): void {
    this.stderrCallbacks.push(callback);
  }

  onClose(callback: (code: number | null) => void): void {
    this.closeCallbacks.push(callback);
  }

  onError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }
}

/**
 * WebSocket implementation of ProcessRunner for Browser local development
 */
export class WebSocketProcessRunner implements ProcessRunner {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private stdoutCallbacks: ((data: string) => void)[] = [];
  private stderrCallbacks: ((data: string) => void)[] = [];
  private closeCallbacks: ((code: number | null) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];

  constructor(wsUrl: string = 'ws://localhost:3001') {
    this.wsUrl = wsUrl;
  }

  spawn(command: string, args: string[], env: Record<string, string> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.ws?.send(
            JSON.stringify({
              type: 'spawn',
              command,
              args,
              env,
            })
          );
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
              case 'stdout':
                this.stdoutCallbacks.forEach((cb) => cb(msg.data));
                break;
              case 'stderr':
                this.stderrCallbacks.forEach((cb) => cb(msg.data));
                break;
              case 'close':
                this.closeCallbacks.forEach((cb) => cb(msg.code));
                break;
              case 'error':
                this.errorCallbacks.forEach((cb) => cb(msg.message));
                break;
            }
          } catch (e: any) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        this.ws.onerror = (err) => {
          this.errorCallbacks.forEach((cb) => cb('WebSocket Connection Error'));
          reject(err);
        };

        this.ws.onclose = () => {
          this.closeCallbacks.forEach((cb) => cb(1));
        };
      } catch (err: any) {
        reject(err);
      }
    });
  }

  async write(message: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection is not open');
    }
    this.ws.send(
      JSON.stringify({
        type: 'write',
        data: message,
      })
    );
  }

  async kill(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'kill' }));
      this.ws.close();
    }
    this.ws = null;
  }

  onStdout(callback: (data: string) => void): void {
    this.stdoutCallbacks.push(callback);
  }

  onStderr(callback: (data: string) => void): void {
    this.stderrCallbacks.push(callback);
  }

  onClose(callback: (code: number | null) => void): void {
    this.closeCallbacks.push(callback);
  }

  onError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }
}

/**
 * Factory helper to get the active process runner based on context environment
 */
export function createProcessRunner(wsUrl?: string): ProcessRunner {
  if (isTauriEnvironment()) {
    return new TauriProcessRunner();
  }
  return new WebSocketProcessRunner(wsUrl);
}
