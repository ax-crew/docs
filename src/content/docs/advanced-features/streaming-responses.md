---
title: Streaming Responses
description: Learn how to use streaming responses with AxCrew agents
---

## Understanding Streaming Responses

AxCrew extends the AxLLM `streamingForward()` method to support streaming responses from agents, allowing you to receive and process agent outputs in real-time. This is particularly useful for:

- Interactive applications that need to display responses as they're generated
- Improving perceived responsiveness of your application
- Providing immediate feedback to users

## Basic Streaming Usage

To use streaming responses, call an agent's `streamingForward()` method, which returns an async generator. You can then consume the stream using a `for await...of` loop:

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

// Create and initialize crew
const crew = new AxCrew('./agentConfig.json');
await crew.addAgentsToCrew(['Planner']);

const planner = crew.agents.get('Planner');

// Stream responses using the async generator
const gen = planner.streamingForward({
  task: "Create a detailed plan for a website"
});

let accumulatedText = '';

if (!gen) {
  throw new Error('Failed to initialize response generator');
}

for await (const chunk of gen) {
  if (chunk.delta && typeof chunk.delta === 'object') {
    const deltaText = 'reply' in chunk.delta ? (chunk.delta.reply as string) : JSON.stringify(chunk.delta);
    accumulatedText += deltaText;
    console.log('Received chunk:', deltaText);
  }
}

console.log('Full response:', accumulatedText);
```

> **Note:**
>The above example assumes your agent's output signature includes a `reply` field (e.g., `... -> reply:string ...`). 

>If your agent's signature is different, adjust the code to extract the appropriate field from `chunk.delta`. For example, if your agent returns a field named `result`, use `chunk.delta.result` instead of `chunk.delta.reply`.

The generator yields chunks as they're generated by the AI provider, allowing you to process them as soon as they arrive.

## Streaming with Sub-agents

Internally, AxLLM uses streaming by default when one agent calls another agent. So there's nothing you need to do to enable it.

## Limitations

While streaming provides many benefits, it's important to be aware of some limitations:

1. **Function Calls**: When an agent uses functions (tools), some providers may temporarily pause the stream while the function is executed.
2. **Formatting**: Markdown, code formatting, and other styled content may appear in pieces before the complete format is visible.
3. **Provider Support**: Not all AI providers support streaming equally well.
4. **Network Reliability**: Streaming is more susceptible to network hiccups than single requests.
