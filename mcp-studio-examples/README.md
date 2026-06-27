# MCP Studio Examples

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

This repository contains fully functional, reference examples of Model Context Protocol (MCP) servers built with the official TypeScript SDK. You can load these servers directly into **MCP Studio** or any compatible MCP client (like Claude Desktop) to test tools execution.

## Available Servers

### 1. Todo Manager (`todo-server`)
An in-memory todo checklist server.
- **Tools**:
  - `list_todos`: Retrieve list of all todos.
  - `add_todo`: Add a new todo item (arguments: `title`).
  - `complete_todo`: Complete a todo item (arguments: `id`).
  - `delete_todo`: Delete a todo item (arguments: `id`).

### 2. Weather Provider (`weather-server`)
A mockup weather reporting server.
- **Tools**:
  - `get_current_weather`: Get real-time weather metrics for a city (arguments: `city`).
  - `get_weather_forecast`: Query multi-day weather conditions (arguments: `city`, `days`).

## Setup and Run

### Install Dependencies
From the root of this folder, run:
```bash
npm install
```

### Build Servers
Compile the TypeScript code:
```bash
# Compile both servers
npm run build

# Or compile individually
npx tsc -p todo-server
npx tsc -p weather-server
```

### Run Servers
Run the compiled JS files on standard streams (`stdio` transport):
```bash
# Start Todo Manager
node todo-server/dist/index.js

# Start Weather Provider
node weather-server/dist/index.js
```

## Loading in MCP Studio
1. Launch **MCP Studio**.
2. Create a new profile.
3. Set the spawn command to `node`.
4. Add arguments pointing to the build path, for example: `C:/path-to-examples/todo-server/dist/index.js`.
5. Connect and explore tools!

## License
MIT License.
