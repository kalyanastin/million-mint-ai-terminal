# Claude Code / OpenCode Model Compatibility Report

## 1. Model Compatibility Matrix

This matrix summarizes the compatibility of various OpenCode gateway models with Claude Code's agentic loop (which relies heavily on tool calling):

| Model ID | Chat Works | Tool Calling Works | Claude Code Compatible | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `nemotron-3-ultra-free` | **Yes** | **No** | **No** | Active free model. Fails with 400 Bad Request if `tools` parameter is passed. |
| `deepseek-v4-flash-free` | **Yes** | **No** | **No** | Active free model. Fails with `tools[0].function: missing field name` when tools are passed. |
| `minimax-m3-free` | **No** | **No** | **No** | Inactive for current key. Returns 401 Unauthorized (promotion ended). |
| `mimo-v2.5-free` | **No** | **No** | **No** | Inactive for current key. Returns 401 Unauthorized (model is disabled). |
| `north-mini-code-free` | **No** | **No** | **No** | Inactive for current key. Returns 401 Unauthorized (model is disabled). |
| `minimax-m3` | **Yes** | **Partial** | **Yes** (Tolerant) | Paid/Subscription model. Tolerates empty tool calling structures, but tool usage execution reliability is low. |
| `qwen-3-coder-27b` | **Yes** | **Yes** | **Yes** (via Proxy) | Paid/Subscription model. Requires a local proxy (like LiteLLM) to perform tool calling schema translations. |
| `claude-3-5-sonnet` | **Yes** | **Yes** | **Yes** (Full) | Paid/Zen model. Gold standard for Claude Code. Natively compatible with Anthropic's Messages format. |

---

## 2. Best Free Model Selection (For Non-Agentic Tasks)

Since both active free models (`nemotron-3-ultra-free` and `deepseek-v4-flash-free`) do not support tool calling, they **cannot run directly inside Claude Code's default terminal**. However, if used in plain-chat mode (without tools) or through a custom local proxy that translates tool formats, they are suited as follows:

### 🚀 Code Editing & Incremental Changes
* **Best Model:** `deepseek-v4-flash-free`
* **Why:** It has been trained extensively on coding tasks, is extremely fast, highly responsive, and handles code formatting/modifications with precision.

### 🔍 Repository Analysis & Architecture Review
* **Best Model:** `nemotron-3-ultra-free`
* **Why:** It features a huge context window (1M tokens) and represents a very large (550B total parameter) reasoning model. This makes it ideal for processing multiple files simultaneously and analyzing codebase dependencies.

### 🌐 React & Next.js Projects
* **Best Model:** `deepseek-v4-flash-free`
* **Why:** DeepSeek has excellent support for modern JavaScript, TypeScript, and React frameworks, generating clean component code and handling Next.js server/client side nuances correctly.

### 🎨 Three.js & WebGL Projects
* **Best Model:** `deepseek-v4-flash-free`
* **Why:** Writing Three.js requires understanding coordinate geometry and mathematics. DeepSeek models exhibit strong performance in WebGL programming and generating canvas animations.

---

## 3. Corrected `settings.json` (Using Highest-Quality Model)

To get a flawless agentic coding experience in Claude Code, the highest-quality compatible model is **`claude-3-5-sonnet`**. If configured through OpenCode Zen or using the official API directly:

### Option A: Using `claude-3-5-sonnet` via OpenCode Zen Gateway
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://opencode.ai/zen",
    "ANTHROPIC_API_KEY": "YOUR_OPENCODE_ZEN_API_KEY",
    "ANTHROPIC_MODEL": "claude-3-5-sonnet",
    "ENABLE_TOOL_SEARCH": "true"
  },
  "model": "claude-3-5-sonnet",
  "effortLevel": "medium"
}
```

### Option B: Direct Integration with Anthropic API (Recommended for 100% Stability)
If you wish to bypass gateway translation layers entirely:
```json
{
  "env": {
    "ANTHROPIC_MODEL": "claude-3-5-sonnet",
    "ENABLE_TOOL_SEARCH": "true"
  },
  "model": "claude-3-5-sonnet",
  "effortLevel": "medium"
}
```
*(Make sure to unset the `ANTHROPIC_BASE_URL` env variable so it defaults to the official Anthropic server, and ensure your terminal's `ANTHROPIC_API_KEY` points to your official Anthropic API key).*
