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

## Example Workflow with State

Here's a complete example of a workflow using state management to respond to a user query:

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

// Initialize crew
const crew = new AxCrew('./agentConfig.json', AxCrewFunctions);
await crew.addAgentsToCrew(['UserProfileAgent', 'HistoryAgent', 'SupportAgent']);

// Get agent instances
const profileAgent = crew.agents.get('UserProfileAgent');
const historyAgent = crew.agents.get('HistoryAgent');
const supportAgent = crew.agents.get('SupportAgent');

// User query and identification
const userId = "user_12345";
const userQuery = "I'm having trouble with my recent order";

// Initialize workflow with user context - userId is set once in state
// and will be implicitly accessed by all functions that need it
crew.state.set('user.id', userId);
crew.state.set('session.started', new Date().toISOString());
crew.state.set('session.currentQuery', userQuery);

// Step 1: Retrieve user profile information
// Note: userId is not passed explicitly, functions will read it from state
const profileResponse = await profileAgent.forward({ 
  action: 'getUserProfile' 
});
crew.state.set('user.profile', profileResponse.profile);

// User profile is now available in state for all agents
const userProfile = crew.state.get('user.profile');
console.log(`Handling request for ${userProfile.name} (${userProfile.email})`);

// Step 2: Fetch conversation history
// Again, userId is accessed from state by underlying functions
const historyResponse = await historyAgent.forward({ 
  action: 'getConversationHistory',
  limit: 5  // Get last 5 conversations
});
crew.state.set('user.conversationHistory', historyResponse.conversations);

// Step 3: Retrieve order information (assuming it's mentioned in query)
const orderInfoResponse = await supportAgent.forward({
  action: 'getOrderInfo'
  // userId is accessed from state, not passed explicitly
});
crew.state.set('user.recentOrders', orderInfoResponse.orders);

// Step 4: Generate response with context from all previous steps
const supportResponse = await supportAgent.forward({
  action: 'generateResponse',
  query: userQuery
  // No need to pass state values explicitly - they're in state
});

// Store response in state
crew.state.set('session.response', supportResponse.message);
crew.state.set('session.completed', new Date().toISOString());

// Log interaction to history
const interaction = {
  timestamp: new Date().toISOString(),
  query: userQuery,
  response: supportResponse.message,
  sentiment: supportResponse.sentiment
};
crew.state.set('session.interaction', interaction);

// Store this interaction in history
await historyAgent.forward({
  action: 'logInteraction',
  interaction: crew.state.get('session.interaction')
  // userId is accessed from state by the function
});

// Example mock data that would be used in this workflow:
/*
UserProfileAgent would return:
{
  profile: {
    id: "user_12345",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    accountType: "premium",
    signupDate: "2022-03-15T08:30:00Z",
    preferences: {
      communicationChannel: "email",
      newsletter: true
    }
  }
}

HistoryAgent would return:
{
  conversations: [
    {
      timestamp: "2023-06-10T14:22:00Z",
      query: "How do I change my shipping address?",
      response: "You can update your shipping address in your account settings...",
      sentiment: "neutral"
    },
    {
      timestamp: "2023-06-15T09:45:00Z",
      query: "My order #ABC123 hasn't arrived yet",
      response: "I see your order #ABC123 shipped on June 12th and is expected to arrive...",
      sentiment: "concerned"
    }
    // Additional conversation history...
  ]
}

SupportAgent (getOrderInfo) would return:
{
  orders: [
    {
      orderId: "ORD-789456",
      date: "2023-06-18T11:30:00Z",
      status: "shipped",
      items: [
        { productId: "PROD-001", name: "Wireless Headphones", quantity: 1, price: 89.99 }
      ],
      shippingAddress: "123 Main St, Anytown, AT 12345",
      trackingNumber: "TRK123456789",
      estimatedDelivery: "2023-06-22"
    }
  ]
}

SupportAgent (generateResponse) would return:
{
  message: "Hello Jane, I see you're inquiring about your recent order of Wireless Headphones (ORD-789456). According to our records, your order was shipped on June 18th and is expected to arrive by June 22nd. The tracking number is TRK123456789. Would you like me to provide more details about the shipment?",
  sentiment: "helpful",
  suggestedActions: ["track_order", "modify_order", "cancel_order"]
}
*/

// Print result
console.log(`Query: ${userQuery}`);
console.log(`Response: ${crew.state.get('session.response')}`);
console.log(`Session duration: ${
  (new Date(crew.state.get('session.completed')).getTime() - 
   new Date(crew.state.get('session.started')).getTime()) / 1000
} seconds`);
``` 