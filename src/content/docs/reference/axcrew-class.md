---
title: AxCrew Class
description: API reference for the AxCrew class
---

## AxCrew Class

The `AxCrew` class is the main entry point for creating and managing a crew of AI agents.

### Constructor

```typescript
constructor(configInput: CrewConfigInput, functions?: FunctionRegistryType)
```

Creates a new AxCrew instance.

**Parameters:**
- `configInput` - Either a path to a JSON configuration file or a configuration object with a `crew` array
- `functions` - Optional. A registry of functions that agents can use. Defaults to an empty object.

**Examples:**

```typescript
// Using a configuration file
const crew = new AxCrew('./agentConfig.json');

// Using a configuration object
const crew = new AxCrew({
  crew: [
    {
      name: "Planner",
      description: "Creates a plan to complete a task",
      signature: "task:string -> plan:string",
      provider: "openai",
      providerKeyName: "OPENAI_API_KEY",
      ai: {
        model: "gpt-4",
        temperature: 0
      }
    }
  ]
});

// Using a configuration file with functions
import { AxCrewFunctions } from '@amitdeshmukh/ax-crew';
const crew = new AxCrew('./agentConfig.json', AxCrewFunctions);
```

### Properties

#### state

```typescript
state: StateInstance
```

A shared state instance that can be accessed by all agents in the crew.

**Example:**

```typescript
// Set state
crew.state.set('key', 'value');

// Get state
const value = crew.state.get('key');

// Get all state
const allState = crew.state.getAll();
```

#### agents

```typescript
agents: Map<string, StatefulAxAgent>
```

A map of all initialized agents in the crew, keyed by agent name.

**Example:**

```typescript
// Get an agent
const planner = crew.agents.get('Planner');

// Check if an agent exists
if (crew.agents.has('Calculator')) {
  // Use Calculator agent
}
```

### Methods

#### addAgent

```typescript
async addAgent(agentName: string): Promise<StatefulAxAgent | undefined>
```

Adds a single agent to the crew by name.

**Parameters:**
- `agentName` - The name of the agent to add

**Returns:** The initialized agent or undefined if the agent could not be initialized

**Example:**

```typescript
// Add an agent
const calculator = await crew.addAgent('Calculator');
```

**Note:** This method requires you to handle dependencies manually. You must add any agents that this agent depends on before calling this method.

#### addAgentsToCrew

```typescript
async addAgentsToCrew(agentNames: string[]): Promise<Map<string, StatefulAxAgent> | undefined>
```

Adds multiple agents to the crew, automatically handling dependencies.

**Parameters:**
- `agentNames` - An array of agent names to add

**Returns:** A map of all initialized agents or undefined if there was an error

**Example:**

```typescript
// Add multiple agents (dependencies are handled automatically)
const agents = await crew.addAgentsToCrew(['Manager', 'Planner']);
```

#### addAllAgents

```typescript
async addAllAgents(): Promise<Map<string, StatefulAxAgent> | undefined>
```

Adds all agents defined in the configuration to the crew, automatically handling dependencies.

**Returns:** A map of all initialized agents or undefined if there was an error

**Example:**

```typescript
// Add all agents from configuration
const agents = await crew.addAllAgents();
```

#### getAggregatedCosts

```typescript
getAggregatedCosts(): AggregatedCosts
```

Gets the aggregated costs for all agents in the crew.

**Returns:** An object containing cost information for all agents and aggregated metrics

**Example:**

```typescript
// Get costs for all agents
const costs = crew.getAggregatedCosts();
console.log(`Total cost: $${costs.totalCost}`);
console.log(`Total tokens: ${costs.aggregatedMetrics.totalTokens}`);
```

#### resetCosts

```typescript
resetCosts(): void
```

Resets the cost tracking for all agents in the crew.

**Example:**

```typescript
// Reset costs
crew.resetCosts();
```

#### Static Methods

##### registerMCPServer

```typescript
static registerMCPServer(name: string, server: MCPServer): void
```

Registers a custom MCP server for use with agents.

**Parameters:**
- `name` - The name of the MCP server
- `server` - The MCP server instance

**Example:**

```typescript
import { createMCPServer } from '@modelcontextprotocol/server';

// Create a custom MCP server
const customServer = createMCPServer({
  name: 'custom-api',
  functions: [
    // Function definitions
  ]
});

// Register the server
AxCrew.registerMCPServer('custom-api', customServer);
```

### Type Definitions

#### CrewConfigInput

```typescript
type CrewConfigInput = string | { crew: AgentConfig[] };
```

The input to the AxCrew constructor, either a path to a configuration file or a configuration object.

#### AgentConfig

```typescript
interface AgentConfig {
  name: string;
  description: string;
  signature: string;
  provider: string;
  providerKeyName: string;
  ai: {
    model: string;
    temperature: number;
    maxTokens?: number;
    [key: string]: any;
  };
  options?: {
    debug?: boolean;
    mcp?: {
      enabled: boolean;
      server: string;
      debug?: boolean;
      serverOptions?: Record<string, any>;
    };
    [key: string]: any;
  };
  agents?: string[];
  examples?: Record<string, any>[];
}
```

Configuration for an individual agent in the crew.

#### FunctionRegistryType

```typescript
type FunctionRegistryType = Record<string, Function | any>;
```

A registry of functions that can be used by agents.

#### AggregatedCosts

```typescript
interface AggregatedCosts {
  totalCost: string;
  byAgent: Record<string, UsageCost>;
  aggregatedMetrics: AggregatedMetrics;
}
```

Aggregated cost information for all agents in the crew.

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

Cost information for an individual agent. 