---
title: Cost Tracking
description: Learn how to track and manage API usage costs with AxCrew
---

## Understanding Cost Tracking

AxCrew provides robust cost tracking capabilities to help you monitor and manage your API usage expenses. The cost tracking system:

- Tracks token usage and associated costs for each agent call
- Maintains both individual agent costs and aggregated crew costs
- Uses high-precision decimal calculations for accuracy
- Supports different pricing tiers for various AI models

## Accessing Cost Information

There are several ways to access cost information in AxCrew:

### 1. Individual Agent Last Usage Cost

Get the cost of the most recent call to an agent:

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

const crew = new AxCrew('./agentConfig.json');
await crew.addAgentsToCrew(['Planner']);

const planner = crew.agents.get('Planner');

// Run the agent
const response = await planner.forward({ task: "Create a plan for a website" });

// Get cost information for the last call
const lastCost = planner.getLastUsageCost();
console.log(lastCost);
```

Example output:
```javascript
{
  promptCost: "0.0003637500000",
  completionCost: "0.0006100000000",
  totalCost: "0.0009737500000",
  tokenMetrics: {
    promptTokens: 291,
    completionTokens: 122,
    totalTokens: 413
  }
}
```

### 2. Individual Agent Accumulated Costs

Get the accumulated costs for all calls to an agent:

```typescript
// Get the accumulated costs for this agent
const accumulatedCost = planner.getAccumulatedCosts();
console.log(accumulatedCost);
```

The output format is the same as `getLastUsageCost()`, but includes all calls made to the agent.

### 3. Aggregated Crew Costs

Get aggregated costs for all agents in the crew:

```typescript
// Get aggregated costs for the entire crew
const crewCosts = crew.getAggregatedCosts();
console.log(crewCosts);
```

Example output:
```javascript
{
  totalCost: "0.0025482500000",
  byAgent: {
    "Planner": {
      promptCost: "0.0003637500000",
      completionCost: "0.0006100000000",
      totalCost: "0.0009737500000",
      tokenMetrics: {
        promptTokens: 291,
        completionTokens: 122,
        totalTokens: 413
      }
    },
    "Calculator": {
      // Cost details for Calculator agent
    },
    "Manager": {
      // Cost details for Manager agent
    }
  },
  aggregatedMetrics: {
    promptTokens: 850,
    completionTokens: 324,
    totalTokens: 1174,
    promptCost: "0.0010625000000",
    completionCost: "0.0014857500000"
  }
}
```

## Cost Structure

The cost object contains the following information:

| Field | Description |
|-------|-------------|
| `promptCost` | Cost for the prompt tokens (high precision string) |
| `completionCost` | Cost for the completion tokens (high precision string) |
| `totalCost` | Total cost of the operation (high precision string) |
| `tokenMetrics` | Token usage statistics |
| `tokenMetrics.promptTokens` | Number of tokens in the prompt |
| `tokenMetrics.completionTokens` | Number of tokens in the completion |
| `tokenMetrics.totalTokens` | Total tokens used |

For the aggregated crew costs, there are additional fields:

| Field | Description |
|-------|-------------|
| `byAgent` | Costs broken down by agent |
| `aggregatedMetrics` | Combined metrics for all agents |

## Resetting Costs

You can reset the cost tracking counters for the entire crew:

```typescript
// Reset all cost tracking
crew.resetCosts();
```

This will reset the accumulated costs for all agents in the crew.

## Cost Tracking with Multiple Sessions

For applications that need to track costs across multiple sessions or for different users, you can combine cost tracking with [state management](/core-concepts/state-management):

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

// Initialize crew
const crew = new AxCrew('./agentConfig.json', AxCrewFunctions);
await crew.addAgentsToCrew(['Planner', 'Writer']);

// Start a new session
crew.state.set('session', {
  id: 'user-123',
  startTime: new Date().toISOString()
});

// Reset costs for new session
crew.resetCosts();

// Run agents
await crew.agents.get('Planner').forward({ task: "Plan a blog post" });
await crew.agents.get('Writer').forward({ task: "Write blog post introduction" });

// Store session costs in state
const sessionCosts = crew.getAggregatedCosts();
crew.state.set('session.costs', sessionCosts);

// Log session summary
console.log(`Session ${crew.state.get('session').id} completed`);
console.log(`Total cost: $${sessionCosts.totalCost}`);
console.log(`Total tokens: ${sessionCosts.aggregatedMetrics.totalTokens}`);
```

## Budget Management

You can implement budget management using the cost tracking features:

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';
import Decimal from 'decimal.js';

// Initialize crew
const crew = new AxCrew('./agentConfig.json');
await crew.addAgentsToCrew(['Researcher', 'Writer']);

// Set budget limit
const budgetLimit = new Decimal('0.50'); // $0.50 budget

// Function to check if within budget
function isWithinBudget() {
  const currentCost = new Decimal(crew.getAggregatedCosts().totalCost);
  return currentCost.lessThan(budgetLimit);
}

// Function to get remaining budget
function getRemainingBudget() {
  const currentCost = new Decimal(crew.getAggregatedCosts().totalCost);
  return budgetLimit.minus(currentCost);
}

// Run with budget checking
async function runWithinBudget() {
  try {
    // Before each operation, check the budget
    if (!isWithinBudget()) {
      throw new Error(`Budget limit reached. Budget: $${budgetLimit}, Used: $${crew.getAggregatedCosts().totalCost}`);
    }
    
    // Run researcher
    await crew.agents.get('Researcher').forward({ query: "Latest AI advancements" });
    
    // Check budget again before next operation
    if (!isWithinBudget()) {
      throw new Error(`Budget limit reached after research. Remaining: $${getRemainingBudget()}`);
    }
    
    // Run writer
    await crew.agents.get('Writer').forward({ topic: "Latest AI advancements" });
    
    // Final budget report
    const finalCost = crew.getAggregatedCosts();
    console.log(`Operation completed. Total cost: $${finalCost.totalCost}`);
    console.log(`Remaining budget: $${getRemainingBudget()}`);
    
  } catch (error) {
    console.error('Budget error:', error.message);
  }
}

// Execute the budget-aware function
runWithinBudget();
```


## Best Practices

1. **Regular Monitoring**: Check costs periodically during development and testing
2. **Budget Limits**: Implement budget caps for production environments
3. **Cost Attribution**: Use state to track costs per user or per session
4. **Logging**: Log cost information alongside other application metrics
5. **Provider Selection**: Choose models based on the cost-performance tradeoff for your use case
