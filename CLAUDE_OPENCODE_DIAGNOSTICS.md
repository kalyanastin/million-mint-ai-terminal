# Claude Code / OpenCode Integration Diagnostics Report

## 1. Root Cause Analysis
The `API Error: 400 Error from provider: Provider returned error` occurs because **Claude Code is an agentic command-line assistant that requires tool calling (function calling) to operate.** 

* **The Mechanism:** Every time you send a prompt in Claude Code (even a simple one like `"hi"`), the Claude Code client wraps your prompt and automatically appends a `tools` parameter containing the schemas for its system tools (e.g., `bash`, `glob_files`, `grep_search`, `view_file`, `write_to_file`) to the request body.
* **The Failure:** The NVIDIA model `nemotron-3-ultra-free` (which resolves under the hood on OpenRouter to `nvidia/nemotron-3-ultra-550b-a55b-20260604:free`) **does not support tool calling / function calling parameters.**
* **The Response:** When the OpenCode Zen gateway proxies the request to the upstream provider with the `tools` parameter included, the provider rejects it and returns a `400 Bad Request` error inside a `200 OK` HTTP status response payload:
  ```json
  {"error":{"message":"Error from provider: Provider returned error","code":400}}
  ```
  Claude Code parses this response and throws the 400 error immediately. When tools are excluded from the payload, the endpoint succeeds and returns a valid response.

---

## 2. Model Status & Correct Identifiers
The verification results for the OpenCode gateway models are as follows:

| Model Name | Correct Model ID | Status / Availability | Tool Call Support |
| :--- | :--- | :--- | :--- |
| **Nemotron 3 Ultra Free** | `nemotron-3-ultra-free` | **Active** (but incompatible with Claude Code due to lack of tool support) | No |
| **MiniMax M3 Free** | `minimax-m3-free` | **Inactive** (Free promotion has ended; requires OpenCode Go subscription) | Yes (when active) |
| **MiMo V2.5 Free** | `mimo-v2.5-free` | **Inactive** (Disabled by provider) | Yes (when active) |
| **North Mini Code Free** | `north-mini-code-free` | **Inactive** (Disabled by provider) | Yes (when active) |

---

## 3. Corrected `settings.json`
Since `nemotron-3-ultra-free` does not support tool calling, you cannot use it with Claude Code. To resolve this, you must switch to a tool-compatible model. 

Below is the corrected `settings.json` (located at `%USERPROFILE%\.claude\settings.json`):

### Option A: Using OpenCode Zen with a Tool-Compatible Model (Recommended)
If you subscribe to **OpenCode Go** or add a pay-as-you-go balance, you can use a model like `minimax-m3` or `qwen-2.5-coder` that supports tool use:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://opencode.ai/zen",
    "ANTHROPIC_API_KEY": "YOUR_OPENCODE_ZEN_API_KEY",
    "ANTHROPIC_MODEL": "minimax-m3",
    "ENABLE_TOOL_SEARCH": "true"
  },
  "model": "minimax-m3",
  "effortLevel": "medium"
}
```

### Option B: Falling Back to Official Anthropic API
If you want to use Claude Code's native agent capabilities with the official API:

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
*(Note: Remove `ANTHROPIC_BASE_URL` to let it fall back to the official Anthropic gateway, and ensure `ANTHROPIC_API_KEY` is set to your official Anthropic key).*

---

## 4. Step-by-Step Remediation Plan

1. **Verify Current Model Availability:** Run the PowerShell command in Section 6 to see if any other free models have been re-enabled, or check your OpenCode Zen console.
2. **Select a Tool-Compatible Model:**
   * If you wish to remain on OpenCode, subscribe to **OpenCode Go** or add a billing balance to gain access to paid/subscription models like `minimax-m3` or `qwen-2.5-coder` which support tool use.
   * If you have an official Anthropic API key, use `claude-3-5-sonnet`.
3. **Update Configuration File:** Open `%USERPROFILE%\.claude\settings.json` and replace the content with the corrected configuration from Section 3.
4. **Restart Claude Code:** Completely exit any running Claude Code terminal sessions and restart the CLI to load the new environment variables and settings.
5. **Run a Test Prompt:** Type `hi` to verify that the agentic loop completes successfully.

---

## 5. Verification Checklist

- [ ] **Endpoint Connectivity Check:** Validate that `https://opencode.ai/zen/v1/models` resolves and is accessible.
- [ ] **API Key Authorization Check:** Confirm your API key is active and has access to the chosen model (non-401 response).
- [ ] **Tool Use Capability Check:** Ensure the model supports the `tools` parameter by executing the Node.js test script.
- [ ] **Claude settings.json Update:** Confirm that `settings.json` has the correct `ANTHROPIC_MODEL` corresponding to the authorized model.
- [ ] **Fresh Session Load:** Verify that Claude Code is restarted after configuration changes.

---

## 6. Diagnostic and Testing PowerShell Commands

Run the following commands in PowerShell to test your configuration outside of Claude Code:

### 1. Enumerate Available Models
This command queries the gateway to list all models authorized for your API key:
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_API_KEY" }
(Invoke-RestMethod -Uri "https://opencode.ai/zen/v1/models" -Headers $headers -Method Get) | ConvertTo-Json -Depth 5
```

### 2. Test Message Without Tools (Inference Check)
This command sends a simple prompt to verify basic connectivity and model inference:
```powershell
$headers = @{ 
    "x-api-key" = "YOUR_API_KEY"
    "anthropic-version" = "2023-06-01"
}
$body = '{"model": "nemotron-3-ultra-free", "max_tokens": 1024, "messages": [{"role": "user", "content": [{"type": "text", "text": "hi"}]}]}'
Invoke-RestMethod -Uri "https://opencode.ai/zen/v1/messages" -Headers $headers -Method Post -Body $body -ContentType "application/json"
```

### 3. Test Message With Tools (Claude Code Compatibility Check)
This command validates if the model/endpoint accepts tool use parameters:
```powershell
$headers = @{ 
    "x-api-key" = "YOUR_API_KEY"
    "anthropic-version" = "2023-06-01"
}
$body = '{"model": "nemotron-3-ultra-free", "max_tokens": 1024, "tools": [{"name": "get_weather", "description": "Get the weather", "input_schema": {"type": "object", "properties": {"location": {"type": "string"}}, "required": ["location"]}}], "messages": [{"role": "user", "content": [{"type": "text", "text": "What is the weather in Boston?"}]}]}'
try {
    $resp = Invoke-RestMethod -Uri "https://opencode.ai/zen/v1/messages" -Headers $headers -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success! The model supports tool calls."
    $resp | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Failure! The model does not support tool calls."
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Error details: $($reader.ReadToEnd())"
    } else {
        Write-Host "Error message: $($_.Exception.Message)"
    }
}
```
