# MCP Studio Documentation

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

This repository contains the developer documentation and portals for **MCP Studio**. It is built as a single-page interactive guide using React, Vite, and Tailwind CSS.

## Features Covered

1. **System Architecture**: Flow diagram showing how Tauri, the WebSocket daemon, the SDK, and custom servers exchange JSON-RPC packets.
2. **Development Guide**: Installation, setups, running developer environments locally, building packages, and conventional commits.
3. **Known Limitations**: WebSocket process permissions, Tauri execution scopes.
4. **Roadmap**: Detail milestones for versions `v0.1.0`, `v0.2.0`, and `v0.3.0`.
5. **FAQ**: Quick answers to common questions about MCP Studio configuration.

## Getting Started

### Local Development
Install dependencies and launch the dev server:
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Contributing
Submit issues or pull requests detailing documentation improvements. Please adhere to conventional commit structures for changes.

## License
MIT License.
