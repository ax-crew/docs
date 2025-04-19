---
title: Crew Configuration
description: Learn how to configure and work with crews in AxCrew
---

## What is a Crew?

A Crew in AxCrew is a team of agents that work together to achieve common goals. Crews provide:

- **Shared Context**: All agents in a crew share the same state
- **Dependency Management**: Crews automatically handle agent dependencies 
- **Coordinated Execution**: Agents can leverage each other's capabilities
- **Unified Configuration**: Define all your agents in one place

## Crew Configuration Options

A crew is defined by a JSON configuration object that includes all agents:

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

You can define your crew configuration:
1. In a separate JSON file
2. Directly as a JavaScript/TypeScript object

## Initializing a Crew

You can initialize a crew in multiple ways:

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

// Using a configuration file
const crew1 = new AxCrew('./agentConfig.json', AxCrewFunctions);

// Using a direct configuration object
const config = {
  crew: [
    // Agent configurations
  ]
};
const crew2 = new AxCrew(config, AxCrewFunctions);
```

The second parameter is a function registry that provides tools available to your agents.

## Adding Agents to a Crew

There are three ways to add agents to your crew:

### Method 1: Add All Agents

```typescript
// Initialize all agents defined in the config
await crew.addAllAgents();

// Get agent instances
const planner = crew.agents?.get("Planner");
const manager = crew.agents?.get("Manager");
```

This method:
- Reads all agents from your configuration
- Automatically determines the correct initialization order based on dependencies
- Initializes all agents in the proper sequence

### Method 2: Add Multiple Agents with Dependencies

```typescript
// Add multiple agents - dependencies will be handled automatically
await crew.addAgentsToCrew(['Manager', 'Planner', 'Calculator']);

// Or add them in multiple steps - order doesn't matter
await crew.addAgentsToCrew(['Calculator']); // Will be initialized first
await crew.addAgentsToCrew(['Manager']);    // Will initialize dependencies
```

### Method 3: Add Individual Agents

```typescript
// Add agents one by one - you must handle dependencies manually
await crew.addAgent('Calculator'); // Add base agent first
await crew.addAgent('Planner');    // Then its dependent
await crew.addAgent('Manager');    // Then agents that depend on both
```

## Shared State in Crews

One of the most powerful features of crews is shared state. All agents in a crew have access to the same state, allowing them to share information and build on each other's work.

```typescript
// Set state at crew level
crew.state.set('name', 'Crew1');
crew.state.set('location', 'Earth');

// Access from any agent
const planner = crew.agents.get("Planner");
planner.state.get('name'); // 'Crew1'

// Set state from an agent
planner.state.set('plan', 'Fly to Mars');

// Access the updated state from another agent
const manager = crew.agents.get("Manager");
manager.state.getAll(); // { name: 'Crew1', location: 'Earth', plan: 'Fly to Mars' }
```

State is also passed to any functions expressed as a class in the `FunctionRegistry`, allowing your tools to access and modify the shared context.

## Dependency Management

Crews handle agent dependencies intelligently:

```typescript
{
  "name": "Manager",
  // ... other config ...
  "agents": ["Planner", "Calculator"] // Dependencies
}
```

When a dependent agent (like Manager) is initialized, the crew ensures all its dependencies (Planner and Calculator) are initialized first.

## Task Execution Example

Here's how you might use a crew to solve a problem:

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

// Create and initialize the crew
const crew = new AxCrew('./agentConfig.json', AxCrewFunctions);
await crew.addAgentsToCrew(['Planner', 'Calculator', 'Manager']);

// Get agent instances
const planner = crew.agents.get("Planner");
const manager = crew.agents.get("Manager");

// User query
const userQuery = "What's the square root of the number of days between now and Christmas?";

// Execute the task in stages
const planResponse = await planner.forward({ task: userQuery });
const managerResponse = await manager.forward({ 
  question: userQuery, 
  plan: planResponse.plan 
});

// Get results
const plan = planResponse.plan;
const answer = managerResponse.answer;

console.log(`Plan: ${plan}`);
console.log(`Answer: ${answer}`);
```

## Tracking Crew Costs

The AxCrew system provides detailed cost tracking for monitoring API usage:

```typescript
// Get aggregated costs for all agents in the crew
const crewCosts = crew.getAggregatedCosts();
console.log(crewCosts);
/* Output example:
{
  totalCost: "0.0025482500000",
  byAgent: {
    "Planner": { ... },
    "Calculator": { ... },
    "Manager": { ... }
  },
  aggregatedMetrics: {
    promptTokens: 850,
    completionTokens: 324,
    totalTokens: 1174,
    promptCost: "0.0010625000000",
    completionCost: "0.0014857500000"
  }
}
*/

// Reset cost tracking if needed
crew.resetCosts();
``` 