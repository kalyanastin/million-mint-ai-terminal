# Claude Code & OpenCode DeepSeek Integration Diagnostics

## 1. DeepSeek Tool Calling Architecture
DeepSeek models natively adhere to the **OpenAI Chat Completions API schema** for tool calling (function calling). They do not natively support or recognize the Anthropic Messages API format.

### Schema Comparison

#### Anthropic (Claude Code format)
Claude Code structures the `tools` array as top-level objects within the array elements:
```json
{
  "tools": [
    {
      "name": "get_weather",
      "description": "Get the weather",
      "input_schema": {
        "type": "object",
        "properties": {
          "location": { "type": "string" }
        },
        "required": ["location"]
      }
    }
  ]
}
```

#### OpenAI/DeepSeek (Required format)
DeepSeek models expect a nested `function` wrapper, with parameters defined inside `parameters`:
```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the weather",
        "parameters": {
          "type": "object",
          "properties": {
            "location": { "type": "string" }
          },
          "required": ["location"]
        }
      }
    }
  ]
}
```

---

## 2. Root Cause of the 400 Error
The error `tools[0].function: missing field name` is thrown when using `deepseek-v4-flash-free` in Claude Code because:

1. **Buggy Translation Layer:** OpenCode Zen's Anthropic-compatibility endpoint (`https://opencode.ai/zen/v1/messages`) receives the Anthropic-formatted request from Claude Code. When proxying it to DeepSeek, the translation layer fails to correctly map the `name` and `input_schema` fields into the nested `function` object.
2. **Malformed Payload Delivery:** As a result of this translation failure, the gateway forwards an empty or incomplete function block to DeepSeek:
   ```json
   "tools": [
     {
       "type": "function",
       "function": {}
     }
   ]
   ```
3. **Strict Validation:** DeepSeek's API performs strict JSON schema validation. When it sees `function` without the mandatory `name` field, it returns the deserialization error:
   ```json
   {"error":{"message":"Error from provider (DeepSeek): Failed to deserialize the JSON body into the target type: tools[0].function: missing field `name` at line 1 column 175","type":"invalid_request_error","param":null,"code":"invalid_request_error"}}
   ```

---

## 3. Compatibility Matrix for Free Models
Under the current user API key, the two available free models behave as follows:

| Model ID | Basic Chat Works | Tool Calling Works | Claude Code Compatible | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `nemotron-3-ultra-free` | **Yes** | **No** | **No** | Fails with general provider 400 error when tools are sent. |
| `deepseek-v4-flash-free` | **Yes** | **No** | **No** | Fails with `tools[0].function: missing field name` when tools are sent. |

*Note: Since Claude Code requires tool calling to function, neither model is compatible in the default CLI mode.*

---

## 4. Remediation Steps

1. **Upgrade/Subscribe to OpenCode Go:** Subscribing to OpenCode Go allows access to models like `minimax-m3` which are more tolerant of schema translation issues and do not throw a 400 error when tools are sent.
2. **Use a Local Translation Proxy:** You can run **LiteLLM** or **Routatic** locally. These gateways intercept Claude Code's requests and correctly rewrite the tool schemas to OpenAI format before forwarding them to DeepSeek.
3. **Switch to Claude 3.5 Sonnet:** For the best possible experience, route to `claude-3-5-sonnet` (the highest-quality compatible model) via OpenCode Zen paid tier or using an official Anthropic API key.
