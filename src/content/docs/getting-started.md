---
title: Getting Started with AxCrew
description: Learn how to install and set up AxCrew in your project
---

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
      name: "Planner",
      description: "Creates a plan to complete a task",
      signature: "task:string \"a task to be completed\" -> plan:string \"a plan to execute the task\"",
      provider: "google-gemini",
      providerKeyName: "GEMINI_API_KEY",
      ai: {
        model: "gemini-1.5-pro",
        temperature: 0
      }
    }
  ]
};

// Create a new instance of AxCrew
const crew = new AxCrew(config);

// Initialize all agents
await crew.addAllAgents();

// Get the Planner agent
const planner = crew.agents.get("Planner");

// Use the agent
const response = await planner.forward({ task: "Create a plan for building a website" });
console.log(response.plan);
```

## Using a Configuration File

For larger projects, you might prefer to keep your configuration in a separate JSON file:

```javascript
// agentConfig.json
{
  "crew": [
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
- Explore [creating custom functions](/core-concepts/creating-functions/) to enhance your agents
- See how to manage [state across agents](/core-concepts/state-management/) in a crew
- Check out the [examples](https://github.com/amitdeshmukh/ax-crew/tree/main/examples) for more complex use cases 