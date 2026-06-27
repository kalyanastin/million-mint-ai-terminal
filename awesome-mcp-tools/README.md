# Awesome MCP Tools Catalog

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A curated catalog of community-built Model Context Protocol (MCP) servers, wrappers, SDK toolkits, and client applications. This catalog is built as an interactive visual directory using React, Vite, and Tailwind CSS.

## Explore the Catalog

The app categorizes tools into:
- **Databases**: SQLite, PostgreSQL, Redis, etc.
- **APIs & Chats**: Slack, Discord, GitHub, Linear, etc.
- **System Utilities**: HEADLESS Puppeteer, Local Filesystem, Fetch URL tools, etc.
- **Developer SDKs**: Node/TypeScript, Python, Rust, etc.
- **Clients & GUIs**: Claude Desktop, MCP Studio, Cursor, etc.

## Setup and Development

### Launch Visual Catalog
Install dependencies and start the Vite server:
```bash
npm install
npm run dev
```

### Production Bundle Build
```bash
npm run build
npm run preview
```

## Contributing
To add your custom server, client, or tool to this list, submit a Pull Request modifying the `toolsList` array inside [src/App.tsx](src/App.tsx).

## License
MIT License.
