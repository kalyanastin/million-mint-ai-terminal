# Contributing to MCP Studio

We are thrilled that you want to contribute to the MCP Studio developer ecosystem!

## Development Setup

We use `pnpm` workspaces for dependency management.

### Prerequisites

* [Node.js v20+](https://nodejs.org/)
* [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository and navigate to the directory:
   ```bash
   git clone https://github.com/mcp-studio/mcp-studio.git
   cd mcp-studio
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development Execution

We run a local Node daemon to proxy process management under web environments.

To launch both the daemon and the client:
```bash
pnpm dev
```

The web client will load at `http://localhost:5173`.

## Pull Request Guidelines

1. **Keep PRs Focused:** Introduce one fix or feature per pull request.
2. **Write Tests:** Ensure all protocol adapters, parser routines, and state hooks have unit tests.
3. **Format Code:** Verify that `pnpm lint` and `pnpm typecheck` run clean.
4. **Follow Semantic Commits:** We require conventional commits (e.g. `feat: add console timeline filter`).
