---
title: Working with Examples
description: Learn how to use examples to improve your AxCrew agents
---

## Understanding Examples

Examples are input/output pairs that help guide your agent's behavior. They work as few-shot learning examples, showing the agent how to respond to specific inputs.

Benefits of using examples:
- Achieve more consistent output formats
- Guide the agent toward specific response styles
- Demonstrate step-by-step problem-solving approaches
- Teach agents how to handle edge cases

## Adding Examples to Agent Configuration

You can add examples to your agent configuration using the `examples` array:

```javascript
{
  "name": "MathTeacher",
  "description": "Solves math problems with step by step explanations",
  "signature": "problem:string \"a math problem to solve\" -> solution:string \"step by step solution with final answer\"",
  "provider": "google-gemini",
  "providerKeyName": "GEMINI_API_KEY",
  "ai": {
    "model": "gemini-1.5-pro",
    "temperature": 0
  },
  "examples": [
    {
      "problem": "what is the square root of 144?",
      "solution": "Let's solve this step by step:\n1. The square root of a number is a value that, when multiplied by itself, gives the original number\n2. For 144, we need to find a number that when multiplied by itself equals 144\n3. 12 × 12 = 144\nTherefore, the square root of 144 is 12"
    },
    {
      "problem": "what is the cube root of 27?",
      "solution": "Let's solve this step by step:\n1. The cube root of a number is a value that, when multiplied by itself twice, gives the original number\n2. For 27, we need to find a number that when cubed equals 27\n3. 3 × 3 × 3 = 27\nTherefore, the cube root of 27 is 3"
    }
  ]
}
```

## Matching Examples to Signatures

For examples to be effective, they must match the input/output signature of your agent:

1. Field names in the examples should exactly match those in your agent's signature
2. Field values should reflect the expected types (strings, numbers, objects, etc.)
3. The format and style of the examples should demonstrate how you want the agent to respond

For an agent with signature:
```
query:string "search query", maxResults:number "max results to return" -> results:string[] "search results"
```

Your examples should look like:
```javascript
"examples": [
  {
    "query": "best hiking spots in California",
    "maxResults": 3,
    "results": ["Yosemite Valley", "Joshua Tree National Park", "Big Sur"]
  },
  {
    "query": "books about artificial intelligence",
    "maxResults": 2,
    "results": ["Life 3.0 by Max Tegmark", "Superintelligence by Nick Bostrom"]
  }
]
```

## Example Quality Guidelines

For the most effective examples:

1. **Be Specific**: Include details that guide the agent's understanding
2. **Use Realistic Data**: Examples should reflect real-world scenarios
3. **Cover Edge Cases**: Include examples that handle unusual inputs or edge cases
4. **Consistent Formatting**: Maintain a consistent format across all examples
5. **Include Reasoning**: For complex tasks, show the reasoning process
6. **Appropriate Length**: Examples should be concise but complete
7. **Diverse Examples**: Include a range of different input scenarios

## Example Types

Different types of examples serve different purposes:

### Format Examples

These examples demonstrate the desired output format:

```javascript
"examples": [
  {
    "topic": "climate change",
    "outline": "# Climate Change: A Global Challenge\n\n## Introduction\n- Definition of climate change\n- Historical context\n\n## Causes\n- Greenhouse gas emissions\n- Deforestation\n- Industrial processes\n\n## Effects\n- Rising sea levels\n- Extreme weather events\n- Biodiversity loss\n\n## Solutions\n- Renewable energy\n- Carbon capture\n- Policy changes\n\n## Conclusion\n- Summary of key points\n- Call to action"
  }
]
```

### Reasoning Examples

These examples demonstrate the reasoning process:

```javascript
"examples": [
  {
    "problem": "If a train travels at 60 mph, how long will it take to travel 150 miles?",
    "solution": "To solve this problem, I need to use the formula:\nTime = Distance ÷ Speed\n\nGiven:\n- Distance = 150 miles\n- Speed = 60 mph\n\nTime = 150 miles ÷ 60 mph\nTime = 2.5 hours\n\nTherefore, it will take the train 2.5 hours (or 2 hours and 30 minutes) to travel 150 miles at 60 mph."
  }
]
```

### Edge Case Examples

These examples show how to handle unusual inputs:

```javascript
"examples": [
  {
    "query": "",
    "response": "I notice you haven't provided a search query. Please enter a specific topic you'd like information about."
  },
  {
    "query": "asdfghjkl",
    "response": "Your query doesn't appear to be a recognizable word or phrase. Could you please clarify what you're looking for?"
  }
]
```

## Example Count Recommendations

While there's no hard rule for how many examples to provide, consider these guidelines:

- **Minimum**: 2-3 examples to show patterns
- **Optimal**: 3-5 examples for most use cases
- **Complex Tasks**: 5-10 examples for more complex tasks
- **Balance**: Too few examples won't guide the agent enough, while too many might confuse it or consume excessive tokens

## Dynamic Examples

You can also generate examples dynamically in your code:

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

// Base configuration without examples
const baseConfig = {
  crew: [{
    name: "ArticleWriter",
    description: "Writes articles on various topics",
    signature: "topic:string, style:string -> article:string",
    provider: "openai",
    providerKeyName: "OPENAI_API_KEY",
    ai: {
      model: "gpt-4",
      temperature: 0.7
    }
    // No examples here
  }]
};

// Generate examples dynamically
const topicStyles = [
  { topic: "Renewable Energy", style: "academic" },
  { topic: "Machine Learning", style: "beginner-friendly" },
  { topic: "Cooking Tips", style: "conversational" }
];

// Create example articles for each topic (in a real scenario, you might have pre-written examples)
const examples = await Promise.all(topicStyles.map(async ({ topic, style }) => {
  // For demonstration - in reality, you'd use pre-written examples
  const article = `This is a sample ${style} article about ${topic}...`;
  return { topic, style, article };
}));

// Add examples to config
baseConfig.crew[0].examples = examples;

// Create crew with examples
const crew = new AxCrew(baseConfig);
await crew.addAllAgents();

// Use the agent
const writer = crew.agents.get('ArticleWriter');
const response = await writer.forward({ 
  topic: "Sustainable Agriculture", 
  style: "informative" 
});
```

## Testing and Refining Examples

To get the best results from your examples:

1. **Start Small**: Begin with a few clear examples
2. **Test Variations**: Try different input scenarios
3. **Analyze Outputs**: Check if the outputs match your expectations
4. **Refine Gradually**: Add or modify examples based on testing results
5. **Adjust Temperature**: Lower temperature settings (0-0.3) will make the agent follow examples more closely

## Examples with Complex Data Structures

Your examples can include complex data structures like arrays and nested objects:

```javascript
"examples": [
  {
    "input": {
      "user": {
        "name": "Jane Smith",
        "preferences": ["technology", "science", "books"]
      },
      "query": "recommend something for me"
    },
    "output": {
      "recommendations": [
        {
          "title": "The Code Book",
          "category": "books",
          "reason": "Based on your interest in technology and science"
        },
        {
          "title": "Quantum Computing for Beginners",
          "category": "books",
          "reason": "Combines your interests in technology and science"
        }
      ],
      "message": "Based on your preferences for technology, science, and books, I've recommended some books that combine these interests."
    }
  }
]
```

## Best Practices

1. **Match Your Use Case**: Tailor examples to your specific use case
2. **Regular Updates**: Refine examples based on actual outputs
3. **Balance Specificity**: Be specific enough to guide but not so rigid that the agent can't generalize
4. **Consistent Formatting**: Maintain the same format across examples
5. **Clear Descriptions**: Include clear descriptions in your agent configuration
6. **Test Thoroughly**: Test with various inputs to ensure examples are effective 