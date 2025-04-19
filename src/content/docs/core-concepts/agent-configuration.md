---
title: Agent Configuration
description: Learn how to configure agents in your AxCrew
---

## Agent Configuration Options

Each agent in your crew is defined by a configuration object with various properties that control its behavior. Here's a complete reference of all available configuration options:

```typescript
{
  name: "AgentName",                // Required: Unique name for the agent
  description: "Agent description",  // Required: What the agent does
  signature: "input:type -> output:type", // Required: Input/output signature (see below)
  provider: "openai",               // Required: AI provider to use
  providerKeyName: "OPENAI_API_KEY", // Required: Env var name for API key
  ai: {                             // Required: AI model configuration
    model: "gpt-4",                 // Required: Model to use
    temperature: 0.7,               // Randomness (0-1)
    ...                             // Other AxLLM model config options
  },
  options: {                        // Optional: Additional settings
    debug: false,                   // Whether to log debug info
    stream: true                   // Whether to stream responses
    ...                           // Other AxCrew options
  },
  agents: ["OtherAgent1", "OtherAgent2"], // Optional: Agents this agent depends on. Note that if you specify agents here, they must be defined in the crew config.
  functions: [                        // Optional: Functions (tools) this agent can use.
    "CurrentDateTime",                // Built-in function
    "DaysBetweenDates",               // Built-in function
    {                                 // Custom function
      name: 'googleSearch',
      description: 'Use this function to search google for links related to the query',
      func: googleSearchAPI,
      parameters: {
        type: 'object',
        properties: {
          query: {
            description: `The query to search for`,
            type: 'string'
          },
        }
      }
    }
  ],
  mcpServers: {                     // Optional: MCP server configurations
    "google-maps": {                // Server name
      "command": "npx",             // Command to launch server
      "args": [                     // Arguments for the command
        "-y",
        "@modelcontextprotocol/server-google-maps"
      ],
      "env": {                      // Environment variables
        "GOOGLE_MAPS_API_KEY": "your_api_key"
      }
    },
    "custom-api": {                 // Example of HTTP transport
      "sseUrl": "http://localhost:3000/sse"
    }
  }
  examples: [                       // Optional: Example input/output pairs depending on the agent's signature.
    {
      input: "example input",
      output: "example output"
    }
  ]
}
```

## Required Fields

| Field | Description |
|-------|-------------|
| `name` | A unique identifier for the agent within the crew. |
| `description` | A clear description of what the agent does. Helps guide the AI model. |
| `signature` | Defines the input and output structure in the format: `input:type -> output:type`. |
| `provider` | The AI provider to use (e.g., "openai", "anthropic", "google-gemini"). |
| `providerKeyName` | The name of the environment variable containing the API key. |
| `ai` | Configuration settings for the AI model (model name, temperature, etc.). |

## AI Configuration

The `ai` object contains settings specific to the AI model:

```typescript
ai: {
  model: "gpt-4",           // Required: Model name (provider-specific)
  temperature: 0.7,         // Optional: Controls randomness (0-1)
  maxTokens: 2000,          // Optional: Maximum response length
  topP: 0.9,                // Optional: Nucleus sampling parameter
  presencePenalty: 0.0,     // Optional: Penalize new token repeat
  frequencyPenalty: 0.0     // Optional: Penalize all repeat
}
```

## Agent Dependencies

Use the `agents` array to specify other agents that this agent depends on:

```typescript
agents: ["Researcher", "Calculator"]
```

When agents have dependencies:
- Dependencies must be initialized before the dependent agent
- The AxCrew system will automatically handle initialization order when using `crew.addAllAgents()` or `crew.addAgentsToCrew()`
- Dependent agents have access to the capabilities of their dependencies

## Adding Examples

Examples help guide the agent's behavior by providing clear input/output pairs:

```typescript
examples: [
  {
    problem: "what is the square root of 144?",
    solution: "Let's solve this step by step:\n1. The square root of a number is a value that, when multiplied by itself, gives the original number\n2. For 144, we need to find a number that when multiplied by itself equals 144\n3. 12 × 12 = 144\nTherefore, the square root of 144 is 12"
  },
  {
    problem: "what is the cube root of 27?",
    solution: "Let's solve this step by step:\n1. The cube root of a number is a value that, when multiplied by itself twice, gives the original number\n2. For 27, we need to find a number that when cubed equals 27\n3. 3 × 3 × 3 = 27\nTherefore, the cube root of 27 is 3"
  }
]
```

Note that the field names in the examples should match your agent's signature.

## Signature Format

![Signature Format](https://private-user-images.githubusercontent.com/832235/318244187-0f0306ea-1812-4a0a-9ed5-76cd908cd26b.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDUwNTE4NjIsIm5iZiI6MTc0NTA1MTU2MiwicGF0aCI6Ii84MzIyMzUvMzE4MjQ0MTg3LTBmMDMwNmVhLTE4MTItNGEwYS05ZWQ1LTc2Y2Q5MDhjZDI2Yi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNDE5JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDQxOVQwODMyNDJaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1hMDNlMGNjMjY3NjE0ZGM5ODA1NzAyYmUzZDAzYjg3ZmYzOTE4N2E0YmRlYWNhNjEyZDdkYzc5MDhhYTVjMzhjJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.JmSzP34k5NKsSSlwUqwj6wUBlwkkh969xa4I0n2Iw8s)


The signature defines the input and output structure for your agent. It follows this format:

```
inputName:inputType "input description" -> outputName:outputType "output description"
```

For example:
```
task:string "a task to be completed" -> plan:string "a plan to execute the task"
```

This defines:
- An input named `task` of type `string`
- An output named `plan` of type `string`
- Descriptions for both input and output

You can have multiple inputs and outputs:

```
query:string "search query" , maxResults:number "maximum results to return" -> results:string[] "search results" , totalCount:number "total available results"
```

For more details on the signature format, see the [AxLLM documentation](https://axllm.dev).


## Supported Providers and Models

AxCrew supports all providers and models supported by [AxLLM](https://github.com/amitdeshmukh/ax-crew/blob/main/src/agents/agentConfig.ts#L3).

| Provider | Environment Variable | Models |
|----------|---------------------|--------|
| `openai` | `OPENAI_API_KEY` | `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`, etc. |
| `anthropic` | `ANTHROPIC_API_KEY` | `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku`, etc. |
| `google-gemini` | `GEMINI_API_KEY` | `gemini-1.5-pro`, `gemini-1.5-flash`, etc. |
| `cohere` | `COHERE_API_KEY` | `command`, `command-r`, `command-r-plus`, etc. |
| `groq` | `GROQ_API_KEY` | `llama-3-8b-8192`, `llama-3-70b-8192`, `mixtral-8x7b-32768`, etc. |
| `together` | `TOGETHER_API_KEY` | `togethercomputer/llama-3-8b`, `togethercomputer/llama-3-70b`, etc. |
| `mistral` | `MISTRAL_API_KEY` | `mistral-tiny`, `mistral-small`, `mistral-medium`, etc. |
| `huggingface` | `HUGGINGFACE_API_KEY` | Various models available through Hugging Face's Inference API |

## Complete Configuration Example

Here's a complete example of a crew with multiple agents:

```json
{
  "crew": [
    {
      "name": "Calculator",
      "description": "Performs mathematical calculations",
      "signature": "equation:string \"mathematical equation to solve\" -> result:number \"calculated result\"",
      "provider": "openai",
      "providerKeyName": "OPENAI_API_KEY",
      "ai": {
        "model": "gpt-3.5-turbo",
        "temperature": 0
      }
    },
    {
      "name": "Planner",
      "description": "Creates a plan to complete a task",
      "signature": "task:string \"a task to be completed\" -> plan:string \"a plan to execute the task\"",
      "provider": "google-gemini",
      "providerKeyName": "GEMINI_API_KEY",
      "ai": {
        "model": "gemini-1.5-pro",
        "temperature": 0
      }
    },
    {
      "name": "Manager",
      "description": "Manages the execution of tasks using other agents",
      "signature": "question:string \"question to be answered\", plan:string \"plan from the Planner\" -> answer:string \"final answer\"",
      "provider": "anthropic",
      "providerKeyName": "ANTHROPIC_API_KEY",
      "ai": {
        "model": "claude-3-sonnet",
        "temperature": 0.2
      },
      "agents": ["Planner", "Calculator"],
      "functions": [
        "CurrentDateTime",
        "DaysBetweenDates"
      ],
      "mcpServers": {
        "playwright": {
          "command": "npx",
          "args": [
            "@playwright/mcp@latest"
          ]
        }
      }
    }
  ]
}
```