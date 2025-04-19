---
title: MCP Integration
description: Learn how to use the Model Context Protocol (MCP) with AxCrew
---

## Understanding MCP

AxCrew supports the Model Context Protocol (MCP), which allows AI agents to interact with external systems through specialized servers. MCP enables agents to:

- Access external APIs and services
- Use browser automation
- Manipulate files and databases
- Interact with complex systems

## MCP Architecture

The MCP integration in AxCrew works as follows:

1. An agent in your crew is configured to use MCP
2. When the agent is called, it connects to an MCP server
3. The server provides the agent with function capabilities
4. The agent can call these functions to interact with external systems
5. Function results are returned to the agent for processing

## Setting Up MCP

To use MCP with AxCrew, you need to:

1. Install the necessary MCP server package
2. Configure your agent to use MCP
3. Start the MCP server
4. Create and use your MCP-enabled agent

### Installing MCP Packages

First, install the required MCP packages:

```bash
npm install @modelcontextprotocol/server-google-maps
# Or other MCP server packages you need
```

### Agent Configuration

Configure your agent to use MCP by setting the appropriate provider and options:

```javascript
{
  "name": "MapsAgent",
  "description": "Finds locations and provides directions using Google Maps",
  "signature": "query:string \"location query\" -> results:object \"location results\"",
  "provider": "anthropic",
  "providerKeyName": "ANTHROPIC_API_KEY",
  "ai": {
    "model": "claude-3-sonnet",
    "temperature": 0
  },
  "options": {
    "mcp": {
      "enabled": true,
      "server": "google-maps",
      "serverOptions": {
        "apiKey": "GOOGLE_MAPS_API_KEY_ENV_VAR"
      }
    }
  }
}
```

The `options.mcp` object configures MCP with:
- `enabled`: Set to `true` to enable MCP
- `server`: Specifies which MCP server to use
- `serverOptions`: Configuration options for the server

## Example: Google Maps Integration

Here's a complete example of using the Google Maps MCP server with AxCrew:

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

// Create the configuration
const config = {
  crew: [
    {
      name: "MapsAgent",
      description: "Finds locations and provides directions using Google Maps",
      signature: "query:string \"location query\" -> results:object \"location results\"",
      provider: "anthropic",
      providerKeyName: "ANTHROPIC_API_KEY",
      ai: {
        model: "claude-3-sonnet",
        temperature": 0
      },
      options: {
        mcp: {
          enabled: true,
          server: "google-maps",
          serverOptions: {
            apiKey: "GOOGLE_MAPS_API_KEY"
          }
        }
      }
    },
    {
      name: "TravelPlanner",
      description": "Plans travel itineraries using the MapsAgent",
      signature: "destination:string \"travel destination\", days:number \"number of days\" -> itinerary:string \"detailed travel itinerary\"",
      provider: "openai",
      providerKeyName: "OPENAI_API_KEY",
      ai: {
        model: "gpt-4",
        temperature: 0.2
      },
      agents: ["MapsAgent"]
    }
  ]
};

// Create and initialize the crew
const crew = new AxCrew(config);
await crew.addAllAgents();

// Get agent instances
const mapsAgent = crew.agents.get("MapsAgent");
const travelPlanner = crew.agents.get("TravelPlanner");

// Use the MapsAgent directly
const locationQuery = "coffee shops near Eiffel Tower";
const mapsResult = await mapsAgent.forward({ query: locationQuery });
console.log("Maps results:", mapsResult.results);

// Use the TravelPlanner which will utilize the MapsAgent
const travelResult = await travelPlanner.forward({
  destination: "Paris, France",
  days: 3
});
console.log("Travel itinerary:", travelResult.itinerary);
```

## Available MCP Servers

AxCrew supports various MCP servers:

| Server Name | Package | Description |
|-------------|---------|-------------|
| `google-maps` | `@modelcontextprotocol/server-google-maps` | Integration with Google Maps API |
| `browser` | `@modelcontextprotocol/server-browser` | Browser automation capabilities |
| `filesystem` | `@modelcontextprotocol/server-filesystem` | File system operations |
| `database` | `@modelcontextprotocol/server-database` | Database interactions |
| `weather` | `@modelcontextprotocol/server-weather` | Weather data services |

## Creating a Custom MCP Server

You can create your own custom MCP server to integrate with specific services:

```typescript
import { createMCPServer } from '@modelcontextprotocol/server';

// Create a custom MCP server
const customServer = createMCPServer({
  name: 'custom-api',
  description: 'Custom API integration',
  functions: [
    {
      name: 'searchData',
      description: 'Search for data in the custom API',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return'
          }
        },
        required: ['query']
      },
      handler: async ({ query, limit = 10 }) => {
        // Implementation for API call
        const results = await callCustomAPI(query, limit);
        return results;
      }
    }
  ]
});

// Register the custom server with AxCrew
AxCrew.registerMCPServer('custom-api', customServer);
```

Then, you can use your custom server in agent configuration:

```javascript
{
  "name": "CustomApiAgent",
  "description": "Uses the custom API",
  "signature": "query:string -> results:object",
  "provider": "openai",
  "providerKeyName": "OPENAI_API_KEY",
  "ai": {
    "model": "gpt-4",
    "temperature": 0
  },
  "options": {
    "mcp": {
      "enabled": true,
      "server": "custom-api",
      "serverOptions": {
        // Custom options for your server
      }
    }
  }
}
```

## MCP with State Management

You can combine MCP with AxCrew's state management to create powerful workflows:

```typescript
import { AxCrew } from '@amitdeshmukh/ax-crew';

// Initialize crew with MCP-enabled agents
const crew = new AxCrew('./agentConfig.json');
await crew.addAgentsToCrew(['MapsAgent', 'WeatherAgent', 'TravelPlanner']);

// Get agent instances
const mapsAgent = crew.agents.get('MapsAgent');
const weatherAgent = crew.agents.get('WeatherAgent');
const travelPlanner = crew.agents.get('TravelPlanner');

// Set initial state
crew.state.set('travel.destination', 'Tokyo, Japan');
crew.state.set('travel.dates', {
  start: '2023-10-01',
  end: '2023-10-07'
});

// Step 1: Get location information
const locationResult = await mapsAgent.forward({
  query: crew.state.get('travel.destination')
});

// Store location data in state
crew.state.set('travel.location', locationResult.results);

// Step 2: Get weather forecast
const weatherResult = await weatherAgent.forward({
  location: crew.state.get('travel.destination'),
  dates: crew.state.get('travel.dates')
});

// Store weather data in state
crew.state.set('travel.weather', weatherResult.forecast);

// Step 3: Create travel plan using gathered data
const planResult = await travelPlanner.forward({
  destination: crew.state.get('travel.destination'),
  days: 7,
  locationData: crew.state.get('travel.location'),
  weatherData: crew.state.get('travel.weather')
});

// Store final plan in state
crew.state.set('travel.plan', planResult.itinerary);

// Output the final plan
console.log(crew.state.get('travel.plan'));
```

## Security Considerations

When using MCP servers, consider these security best practices:

1. **API Keys**: Store API keys in environment variables, not in code
2. **Access Control**: Limit what your MCP server can access
3. **Input Validation**: Validate inputs before passing them to external services
4. **Rate Limiting**: Implement rate limiting to prevent API abuse
5. **Error Handling**: Handle errors gracefully to avoid exposing sensitive information

Example of secure API key handling:

```typescript
// In your .env file
GOOGLE_MAPS_API_KEY=your_api_key

// In your code
const config = {
  crew: [{
    name: "MapsAgent",
    // ... other config ...
    options: {
      mcp: {
        enabled: true,
        server: "google-maps",
        serverOptions: {
          apiKey: "GOOGLE_MAPS_API_KEY" // Environment variable name
        }
      }
    }
  }]
};
```

## Debugging MCP

To debug MCP interactions, enable debug mode:

```typescript
const config = {
  crew: [{
    name: "MapsAgent",
    // ... other config ...
    options: {
      debug: true,
      mcp: {
        enabled: true,
        server: "google-maps",
        debug: true, // Enable MCP-specific debugging
        serverOptions: {
          apiKey: "GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }]
};
```

This will output detailed logs of the MCP server interactions, including:
- Function calls made by the agent
- Parameters passed to functions
- Results returned by functions
- Any errors that occur

## MCP Performance Optimization

To optimize MCP performance:

1. **Caching**: Cache results when possible to reduce API calls
2. **Minimize Data**: Request and transfer only the data you need
3. **Batching**: Batch multiple requests when possible
4. **Error Handling**: Implement retries for transient errors
5. **Timeouts**: Set appropriate timeouts for external API calls

Example of implementing caching:

```typescript
// Simple in-memory cache
const cache = new Map();

const customServer = createMCPServer({
  name: 'api-with-cache',
  functions: [
    {
      name: 'getData',
      parameters: {
        // ... parameter definition ...
      },
      handler: async ({ query, limit }) => {
        // Create cache key
        const cacheKey = `${query}:${limit}`;
        
        // Check cache first
        if (cache.has(cacheKey)) {
          return cache.get(cacheKey);
        }
        
        // If not in cache, make API call
        const results = await callExternalAPI(query, limit);
        
        // Store in cache
        cache.set(cacheKey, results);
        
        return results;
      }
    }
  ]
});
``` 