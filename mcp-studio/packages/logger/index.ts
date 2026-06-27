export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'system' | 'rpc' | 'stdout' | 'stderr';
  message: string;
  meta?: any;
}

export type LogListener = (entry: LogEntry) => void;

class Logger {
  private listeners: Set<LogListener> = new Set();
  private useColors: boolean = typeof process !== 'undefined' && process.stdout?.isTTY;

  // ANSI colors
  private colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
  };

  subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setColorsEnabled(enabled: boolean) {
    this.useColors = enabled;
  }

  private colorize(color: keyof typeof this.colors, text: string): string {
    if (!this.useColors) return text;
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  private emit(level: LogEntry['level'], category: LogEntry['category'], message: string, meta?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      meta,
    };

    // Call subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (err) {
        console.error('Logger listener threw an error:', err);
      }
    });

    // Console output
    const formattedTime = this.colorize('gray', `[${entry.timestamp}]`);
    const formattedCategory = this.colorize('magenta', `[${category.toUpperCase()}]`);
    let formattedLevel = level.toUpperCase();
    if (level === 'info') formattedLevel = this.colorize('green', formattedLevel);
    else if (level === 'warn') formattedLevel = this.colorize('yellow', formattedLevel);
    else if (level === 'error') formattedLevel = this.colorize('red', formattedLevel);
    else if (level === 'debug') formattedLevel = this.colorize('cyan', formattedLevel);

    const logLine = `${formattedTime} ${formattedLevel} ${formattedCategory} ${message}`;
    
    if (level === 'error') {
      console.error(logLine);
      if (meta) console.error(meta);
    } else if (level === 'warn') {
      console.warn(logLine);
      if (meta) console.warn(meta);
    } else {
      console.log(logLine);
      if (meta) console.log(meta);
    }
  }

  info(category: LogEntry['category'], message: string, meta?: any) {
    this.emit('info', category, message, meta);
  }

  warn(category: LogEntry['category'], message: string, meta?: any) {
    this.emit('warn', category, message, meta);
  }

  error(category: LogEntry['category'], message: string, meta?: any) {
    this.emit('error', category, message, meta);
  }

  debug(category: LogEntry['category'], message: string, meta?: any) {
    this.emit('debug', category, message, meta);
  }

  // MCP JSON-RPC specific log formatters
  logRpcRequest(id: string | number, method: string, params?: any) {
    const msg = `RPC Request #${id} -> Method: ${method}`;
    this.info('rpc', msg, params ? { params } : undefined);
  }

  logRpcResponse(id: string | number, durationMs: number, result?: any, error?: any) {
    if (error) {
      const msg = `RPC Error #${id} <- Failed in ${durationMs}ms`;
      this.error('rpc', msg, { error });
    } else {
      const msg = `RPC Response #${id} <- Succeeded in ${durationMs}ms`;
      this.info('rpc', msg, result ? { result } : undefined);
    }
  }

  logRpcNotification(method: string, params?: any) {
    const msg = `RPC Notification ~> Method: ${method}`;
    this.info('rpc', msg, params ? { params } : undefined);
  }
}

export const mcpLogger = new Logger();
