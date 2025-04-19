---
title: MCP Integration
description: Integrate MCP (Model Context Protocol) servers with AxCrew to connect your agents to external APIs and services.
---

Integrate MCP (Model Context Protocol) servers with AxCrew to connect your agents to external APIs and services.

## What is MCP?

AxLLM and AxCrew both support the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), which allows agents to interact with external systems (APIs, websites, databases, etc.) via specialized MCP servers. MCP servers expose functions that agents can call as tools.

For a quick overview of MCP, check out this video:

<iframe src="https://www.youtube.com/embed/eP_7BXvKNPE" title="What is MCP?" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

---

## How MCP Works in AxCrew

1. You configure one or more MCP servers in your agent config using the `mcpServers` field.
2. When the agent is initialized, AxCrew launches/connects to the MCP server(s). Internally, AxCrew initializes the MCP server(s) and sets up the AxAgent to use the MCP server(s) as part of its toolset.
4. The agent can call functions exposed by the MCP server as part of its toolset. 

---

## Agent Configuration Example for MCP

Here's how to configure an agent to use the Google Maps MCP server:

```jsonc
{
  "name": "MapsAgent",
  "description": "Handles location-based queries and navigation",
  "signature": "userQuery:string \"a question to be answered\" -> answer:string \"the answer to the question\"",
  "provider": "openai",
  "providerKeyName": "OPENAI_API_KEY",
  "ai": {
    "model": "gpt-4.1-2025-04-14",
    "temperature": 0
  },
  "options": {
    "debug": true,
    "stream": false,
    "debugHideSystemPrompt": false,
    "maxTokens": 2000
  },
  "mcpServers": {
    "google-maps": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-google-maps"
      ],
      "env": {
        "GOOGLE_MAPS_API_KEY": "your_google_maps_api_key"
      }
    }
  }
}
```

- The `mcpServers` field is a map of server names to their launch/config options.
- For most servers, use the `command`, `args`, and `env` fields to specify how to launch the server and pass API keys.
- You can run multiple MCP servers by adding more entries to the `mcpServers` object.

---

## Full Example (TypeScript)

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

const config = {
  crew: [
    {
      name: "MapsAgent",
      description: "Handles location-based queries and navigation",
      signature: 'userQuery:string "a question to be answered" -> answer:string "the answer to the question"',
      provider: "openai",
      providerKeyName: "OPENAI_API_KEY",
      ai: {
        model: "gpt-4.1-2025-04-14",
        temperature: 0,
      },
      options: {
        debug: true,
        stream: false,
        debugHideSystemPrompt: false,
        maxTokens: 2000,
      },
      mcpServers: {
        "google-maps": {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-google-maps"],
          env: {
            GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
          },
        },
      },
    },
    {
      name: "ManagerAgent",
      description: "Completes a user specified task",
      signature: 'question:string "a question to be answered" -> answer:string "the answer to the question"',
      provider: "openai",
      providerKeyName: "OPENAI_API_KEY",
      ai: {
        model: "gpt-4o-mini",
        maxTokens: 1000,
        temperature: 0,
      },
      options: {
        debug: true,
      },
      agents: ["MapsAgent"],
    },
  ],
};

const crew = new AxCrew(config);
await crew.addAllAgents();

const managerAgent = crew.agents.get("ManagerAgent");
const mapsAgent = crew.agents.get("MapsAgent");

const userQuery = "Are there any cool bars around the Eiffel Tower in Paris within 5 min walking distance";
const { answer } = await managerAgent.forward({ question: userQuery });
console.log("Answer:", answer);
```

---

## Supported MCP Server Configurations

### Stdio Transport (most common)

```jsonc
"mcpServers": {
  "google-maps": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-google-maps"],
    "env": {
      "GOOGLE_MAPS_API_KEY": "your_api_key"
    }
  }
}
```

### HTTP Transport

```jsonc
"mcpServers": {
  "custom-api": {
    "sseUrl": "http://localhost:3000/sse"
  }
}
```

---

## Best Practices

- **API Keys:** Always use the `env` field to pass API keys, never hardcode them.
- **Multiple Servers:** You can specify multiple MCP servers in the `mcpServers` object.
- **Debugging:** Use `"options": { "debug": true }` for verbose logs.
- **Security:** Limit what your MCP server can access, validate all inputs, and handle errors gracefully.

---

## Example: Using Multiple MCP Servers

```jsonc
"mcpServers": {
  "google-maps": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-google-maps"],
    "env": { "GOOGLE_MAPS_API_KEY": "your_api_key" }
  },
  "weather": {
    "command": "uvx",
    "args": ["--from", "git+https://github.com/adhikasp/mcp-weather.git", "mcp-weather"],
    "env": {
      "ACCUWEATHER_API_KEY": "your_api_key_here"
    }
  }
}
```

---

## Further Reading

- See the [examples directory](https://github.com/amitdeshmukh/ax-crew/tree/main/examples) for more MCP agent examples.
- See the [README](https://github.com/amitdeshmukh/ax-crew/blob/main/README.md) for general AxCrew usage. 