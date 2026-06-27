# MCP Studio

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

MCP Studio is a professional developer workbench, tool explorer, and debugger for Anthropic's **Model Context Protocol (MCP)**. It provides a visual playground to run, query, and test local or remote MCP servers with dynamic UI forms, raw JSON-RPC tracking, and live stdin/stdout streaming logs.

## Key Features

- **Visual Dashboard**: Explore exposed capabilities (tools, prompts, resources) returned by local process commands.
- **Dynamic Input Forms**: Dynamically compiles JSON Schema parameters into auto-validated React input elements (using `@mcp-studio/schema-form`).
- **Interactive JSON Inspector**: Inspect deep nested outputs using a collapsible key-value viewer (using `@mcp-studio/json-inspector`).
- **Dual Runtime Support**: Run natively as a desktop application (via Tauri) or inside any standard web browser using a secure local WebSocket runner daemon.
- **RPC Timeline Drawer**: Track sent requests, responses, notifications, process execution durations, and standard streams (`stdout`/`stderr`).
- **companion CLI Utility**: Inspect MCP servers and run process daemons directly from command-line terminals.

## Monorepo Project Structure

```
mcp-studio/
├── apps/
│   └── desktop/                 # Vite + React + Tauri Desktop app window
├── packages/
│   ├── sdk/                     # Process runner adapters (Tauri command, browser WebSocket)
│   ├── react/                   # React hooks (useMcpServer) for protocol flows
│   ├── cli/                     # CLI daemon & inspection terminal runner
│   ├── logger/                  # Console logger formatters using ANSI colors
│   ├── json-inspector/          # Collapsible JSON node react tree viewer
│   └── schema-form/             # Dynamic JSON schema react form builder
└── scripts/
    └── mcp-runner-daemon.js     # Background runner daemon
```

## Quick Start

### 1. Prerequisites
Ensure you have Node.js (v18+) and `pnpm` installed.

### 2. Setup & Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/mcp-studio/mcp-studio.git
cd mcp-studio
pnpm install
```

### 3. Run the Development Server
This starts both the companion WebSocket daemon and the Vite frontend:
```bash
pnpm dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the playground.

### 4. Build and Test
```bash
pnpm build
pnpm lint
pnpm typecheck
```

## API Documentation & Usage

### `@mcp-studio/sdk`
Initialize a process runner to communicate with a local server over stdin/stdout channels:
```typescript
import { createProcessRunner } from '@mcp-studio/sdk';

const runner = createProcessRunner();
// Hook stderr and stdout callbacks
runner.onStdout((data) => console.log('Stdout:', data));
runner.onStderr((err) => console.error('Stderr:', err));

// Spawn process
await runner.spawn('npx', ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost:5432/mydb']);
```

### `@mcp-studio/react`
Use the custom hook to bind server interactions, capabilities discovery, and execution states:
```tsx
import { useMcpServer } from '@mcp-studio/react';

function App() {
  const { status, tools, connect, disconnect, callTool } = useMcpServer();

  const handleStart = () => {
    connect('npx', ['-y', '@modelcontextprotocol/server-filesystem', 'C:/Users']);
  };

  return (
    <div>
      <p>Connection: {status}</p>
      <button onClick={handleStart}>Connect Server</button>
      {tools.map(t => (
        <div key={t.name}>{t.name}</div>
      ))}
    </div>
  );
}
```

### `@mcp-studio/cli`
Compile and run command-line interface utilities:
```bash
# Start the runner daemon
mcp-studio start --port 3001

# Inspect a local server
mcp-studio inspect npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb
```

## Contributing
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on code styles, conventional commits, and guidelines.

## License
Released under the [MIT License](LICENSE).
