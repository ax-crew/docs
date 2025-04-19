---
title: Getting Started with AxCrew
description: Learn how to install and set up AxCrew in your project
---

## What is AxCrew?

AxCrew is a framework for building and managing **crews of AI agents**. It is built on top of [AxLLM](https://axllm.dev), a powerful typescript framework for building and managing LLM agents.

## Installation

Install the AxCrew package using npm:

```bash
npm install @amitdeshmukh/ax-crew
```

Since AxLLM is a peer dependency, you'll need to install it separately:

```bash
npm install @ax-llm/ax
```

## Environment Setup

Create a `.env` file in your project root with the API keys for the AI providers you intend to use:

```env
# OpenAI
OPENAI_API_KEY=your_openai_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Google Gemini
GEMINI_API_KEY=your_gemini_key

# Add other provider keys as needed
```

For a complete list of supported environment variables, check the [.env.example](https://github.com/amitdeshmukh/ax-crew/blob/main/.env.example) file in the repository.

## Basic Setup

Here's a minimal example of how to set up an AxCrew instance with a single agent:

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

// Create the configuration object
const config = {
  crew: [
    {
      name: "Manager",
      description: "Completes a task or responds to a question",
      signature: "task:string \"task or question from the user\" -> reply:string \"detailed response addressing the user's task\"",
      provider: "openai",
      providerKeyName: "OPENAI_API_KEY", 
      ai: {
        model: "gpt-4o-mini",
        temperature: 0.7
      }
    }
  ]
};

// Create a new instance of AxCrew
const crew = new AxCrew(config);

// Initialize all agents
await crew.addAllAgents();

// Get the Planner agent
const manager = crew.agents.get("Manager");

// Use the agent
const { reply } = await manager.forward({ task: "Create a plan for building a website" });
console.log(reply);
```

## Using a Configuration File

For larger projects, you might prefer to keep your configuration in a separate JSON file:

```javascript
// agentConfig.json
{
  "crew": [
    {
      "name": "Manager",
      "description": "Completes a task or responds to a question",
      "signature": "task:string \"task or question from the user\" -> reply:string \"detailed response addressing the user's task\"",
      "provider": "openai",
      "providerKeyName": "OPENAI_API_KEY",
      "ai": {
        "model": "gpt-4o-mini",
        "temperature": 0.7
      }
    }
  ]
}
```

You can then load the configuration from the file:

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

// Create a new instance of AxCrew using a config file
const configFilePath = './agentConfig.json';
const crew = new AxCrew(configFilePath);

// Initialize all agents
await crew.addAllAgents();
```

## Next Steps

- Learn how to [configure agents](/core-concepts/agent-configuration/) in detail
- Learn more about [Crew Configuration](/core-concepts/crew-configuration/)
- Integrate [MCP Servers](/advanced-features/mcp-integration/)
- Explore [creating custom functions](/core-concepts/creating-functions/) to enhance your agents
- See how to manage [state across agents](/core-concepts/state-management/) in a crew
- Check out the [examples](https://github.com/amitdeshmukh/ax-crew/tree/main/examples) for more use cases 