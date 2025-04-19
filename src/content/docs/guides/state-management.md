---
title: State Management
description: Learn how to use shared state across agents in your AxCrew
---

## Understanding State in AxCrew

AxCrew provides a state management system that allows sharing data between agents and functions in your crew. The state system is accessible through the `state` property available on both the `AxCrew` instance and individual agents.

Key features of the state management system:
- **Shared State**: All agents in a crew share the same state instance
- **Type Safety**: State values are typed with TypeScript (when using TypeScript)
- **Persistence**: State persists across agent interactions
- **Function Access**: Functions can access and modify the shared state

## Accessing State

You can access the state at two levels:

### Crew-level State Access

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

const crew = new AxCrew(configFilePath);

// Set state values
crew.state.set('name', 'Crew1');
crew.state.set('location', 'Earth');

// Get state values
const name = crew.state.get('name');  // 'Crew1'
const location = crew.state.get('location');  // 'Earth'

// Get all state values
const allState = crew.state.getAll();  // { name: 'Crew1', location: 'Earth' }
```

### Agent-level State Access

Individual agents also have access to the same shared state:

```typescript
// Initialize agents
await crew.addAllAgents();

const planner = crew.agents.get('Planner');
const manager = crew.agents.get('Manager');

// Set state from Planner agent
planner.state.set('plan', 'Fly to Mars');

// Access the same state value from Manager agent
const plan = manager.state.get('plan');  // 'Fly to Mars'
```

## State in Functions

State can be shared with functions expressed as classes in the `FunctionRegistry`. This allows functions to access and modify the shared state:

```typescript
import { AxFunction } from '@ax-llm/ax';
import type { FunctionRegistryType, StateInstance } from '@amitdeshmukh/ax-crew';

class DataStore {
  constructor(private state: StateInstance) {}
  
  toFunction(): AxFunction {
    return {
      name: 'SaveData',
      description: 'Save data to the shared state',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'State key' },
          value: { type: 'string', description: 'Value to store' }
        },
        required: ['key', 'value']
      },
      func: async ({ key, value }) => {
        // Save to state
        this.state.set(key, value);
        
        // Get current timestamp
        const timestamp = new Date().toISOString();
        
        // Track last update in state
        this.state.set('lastUpdate', { key, timestamp });
        
        return { success: true, message: `Saved ${key} at ${timestamp}` };
      }
    };
  }
}

// Create function registry
const myFunctions: FunctionRegistryType = {
  SaveData: DataStore
};

// Initialize AxCrew with functions
const crew = new AxCrew(configFilePath, myFunctions);
```

## Complex State Management

For more complex data, you can store objects, arrays, and nested structures in the state:

```typescript
// Store a complex object
crew.state.set('user', {
  id: 123,
  name: 'Jane Doe',
  preferences: {
    theme: 'dark',
    notifications: true
  },
  history: [
    { action: 'login', timestamp: '2023-01-01T12:00:00Z' },
    { action: 'search', timestamp: '2023-01-01T12:05:00Z' }
  ]
});

// Retrieve the object
const user = crew.state.get('user');
console.log(user.preferences.theme);  // 'dark'
```

## State Updates Across Agent Calls

State persists across multiple agent calls, allowing for complex workflows:

```typescript
// Step 1: User query received by Planner
const planResponse = await planner.forward({ task: userQuery });

// Planner stores the plan in state
planner.state.set('currentPlan', planResponse.plan);

// Step 2: Calculator agent performs some calculation
const calcResponse = await calculator.forward({ equation: '2+2' });

// Calculator stores the result in state
calculator.state.set('calculationResult', calcResponse.result);

// Step 3: Manager accesses both the plan and calculation to generate final answer
const currentPlan = manager.state.get('currentPlan');
const calculationResult = manager.state.get('calculationResult');

const managerResponse = await manager.forward({ 
  question: userQuery,
  plan: currentPlan,
  calculationResult: calculationResult
});
```

## Best Practices

1. **Consistent Keys**: Use consistent naming conventions for state keys
2. **Documentation**: Document what state values are expected/used by each agent and function
3. **Default Values**: Always check if a state value exists before using it
4. **Cleanup**: Clear unnecessary state values when they're no longer needed
5. **Scoping**: Use prefixes for state keys to avoid collisions between different subsystems
6. **Type Safety**: Use TypeScript to ensure type safety when accessing state values

Example of best practices:

```typescript
// Using prefixes for state keys to avoid collisions
planner.state.set('planner.currentPlan', planData);
calculator.state.set('calculator.result', 42);

// Checking if state exists before using it
const plan = manager.state.get('planner.currentPlan');
if (plan) {
  // Use the plan
} else {
  // Handle missing plan
}

// Cleaning up state when done
manager.state.set('planner.currentPlan', null);

// Using TypeScript for type safety
interface UserData {
  id: number;
  name: string;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

crew.state.set('user', userData as UserData);
const user = crew.state.get('user') as UserData;
```

## Example Workflow with State

Here's a complete example of a workflow using state:

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

// Initialize crew
const crew = new AxCrew('./agentConfig.json', AxCrewFunctions);
await crew.addAgentsToCrew(['Planner', 'Calculator', 'Manager']);

// Get agent instances
const planner = crew.agents.get('Planner');
const calculator = crew.agents.get('Calculator');
const manager = crew.agents.get('Manager');

// User query
const userQuery = "Calculate the square root of the number of days between now and Christmas";

// Initialize workflow state
crew.state.set('workflow.started', new Date().toISOString());
crew.state.set('workflow.userQuery', userQuery);

// Step 1: Create a plan
const planResponse = await planner.forward({ task: userQuery });
crew.state.set('workflow.plan', planResponse.plan);

// Step 2: Use the Calculator agent for date calculation
// Calculate days until Christmas
const today = new Date();
const christmas = new Date(today.getFullYear(), 11, 25); // Month is 0-indexed (11 = December)
if (today > christmas) {
  christmas.setFullYear(christmas.getFullYear() + 1);
}
const daysUntilChristmas = Math.ceil((christmas.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
crew.state.set('workflow.daysUntilChristmas', daysUntilChristmas);

// Step 3: Calculate square root
const calcResponse = await calculator.forward({ equation: `sqrt(${daysUntilChristmas})` });
crew.state.set('workflow.squareRoot', calcResponse.result);

// Step 4: Generate final answer using all collected data
const managerResponse = await manager.forward({ 
  question: userQuery,
  plan: crew.state.get('workflow.plan'),
  days: crew.state.get('workflow.daysUntilChristmas'),
  result: crew.state.get('workflow.squareRoot')
});

// Store final answer in state
crew.state.set('workflow.finalAnswer', managerResponse.answer);
crew.state.set('workflow.completed', new Date().toISOString());

// Print result
console.log(`Question: ${userQuery}`);
console.log(`Plan: ${crew.state.get('workflow.plan')}`);
console.log(`Days until Christmas: ${crew.state.get('workflow.daysUntilChristmas')}`);
console.log(`Square root result: ${crew.state.get('workflow.squareRoot')}`);
console.log(`Final answer: ${crew.state.get('workflow.finalAnswer')}`);
``` 