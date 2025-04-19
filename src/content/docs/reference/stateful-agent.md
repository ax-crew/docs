---
title: StatefulAxAgent Class
description: API reference for the StatefulAxAgent class
---

## StatefulAxAgent Class

The `StatefulAxAgent` class represents an individual agent in an AxCrew. This class extends the base AxAgent class from AxLLM and adds state management capabilities.

### Constructor

```typescript
constructor(agentConfig: AgentConfig, state: StateInstance, dependentAgents?: Map<string, StatefulAxAgent>)
```

Creates a new StatefulAxAgent instance.

**Parameters:**
- `agentConfig` - Configuration for the agent
- `state` - The shared state instance
- `dependentAgents` - Optional. Map of dependent agents this agent can use

**Note:** You typically don't create instances of this class directly. Instead, they are created by the AxCrew class when you call `addAgent`, `addAgentsToCrew`, or `addAllAgents`.

### Properties

#### state

```typescript
state: StateInstance
```

The shared state instance that can be accessed by this agent.

**Example:**

```typescript
// Set state
agent.state.set('result', 42);

// Get state
const result = agent.state.get('result');
```

#### name

```typescript
name: string
```

The name of the agent as defined in the configuration.

**Example:**

```typescript
console.log(`Agent name: ${agent.name}`);
```

#### config

```typescript
config: AgentConfig
```

The complete configuration for this agent.

**Example:**

```typescript
console.log(`Agent model: ${agent.config.ai.model}`);
```

### Methods

#### forward

```typescript
async forward(
  input: Record<string, any>, 
  options?: { onStream?: (chunk: string) => void }
): Promise<Record<string, any>>
```

Executes the agent with the provided input.

**Parameters:**
- `input` - The input to the agent (should match the input signature)
- `options` - Optional. Additional options for execution
  - `onStream` - A callback function that receives chunks of the response as they are generated

**Returns:** The agent's response (matches the output signature)

**Example:**

```typescript
// Basic usage
const response = await agent.forward({ task: "Create a plan for a blog post" });
console.log(response.plan);

// With streaming
await agent.forward(
  { task: "Create a detailed plan" },
  {
    onStream: (chunk) => {
      process.stdout.write(chunk);
    }
  }
);
```

#### getLastUsageCost

```typescript
getLastUsageCost(): UsageCost | undefined
```

Gets the cost information for the most recent call to the agent.

**Returns:** Cost information or undefined if no calls have been made

**Example:**

```typescript
const lastCost = agent.getLastUsageCost();
if (lastCost) {
  console.log(`Last call cost: $${lastCost.totalCost}`);
  console.log(`Tokens used: ${lastCost.tokenMetrics.totalTokens}`);
}
```

#### getAccumulatedCosts

```typescript
getAccumulatedCosts(): UsageCost | undefined
```

Gets the accumulated cost information for all calls to the agent.

**Returns:** Accumulated cost information or undefined if no calls have been made

**Example:**

```typescript
const costs = agent.getAccumulatedCosts();
if (costs) {
  console.log(`Total accumulated cost: $${costs.totalCost}`);
  console.log(`Total tokens used: ${costs.tokenMetrics.totalTokens}`);
}
```

#### resetCosts

```typescript
resetCosts(): void
```

Resets the cost tracking for this agent.

**Example:**

```typescript
// Reset costs for this agent
agent.resetCosts();
```

### Usage in AxCrew

Agents are typically accessed through the AxCrew's `agents` map:

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

const crew = new AxCrew('./agentConfig.json');
await crew.addAllAgents();

// Get an agent from the crew
const planner = crew.agents.get('Planner');

// Use the agent
const response = await planner.forward({ task: "Create a plan" });
console.log(response.plan);

// Check agent costs
const cost = planner.getLastUsageCost();
console.log(`Cost: $${cost.totalCost}`);
```

### Sub-agent Usage

When an agent depends on other agents, it can use them as sub-agents:

```typescript
// Manager agent depends on Planner and Calculator
const manager = crew.agents.get('Manager');

// Get usage costs including sub-agent costs
const managerResponse = await manager.forward({ question: "How long will it take?" });
const totalCost = manager.getAccumulatedCosts();
```

The `getAccumulatedCosts()` method will include costs from any sub-agent calls made by this agent.

### Type Definitions

#### UsageCost

```typescript
interface UsageCost {
  promptCost: string;
  completionCost: string;
  totalCost: string;
  tokenMetrics: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

Cost information for an agent call.

#### StateInstance

```typescript
interface StateInstance {
  set: (key: string, value: any) => void;
  get: (key: string) => any;
  getAll: () => Record<string, any>;
}
```

Interface for the state object that agents can access. 