---
title: Creating Custom Functions
description: Learn how to create and use custom functions with your AxCrew agents
---

## Function Registry

Functions (also known as tools) allow your agents to interact with external systems, process data, or perform specialized tasks. The `FunctionRegistry` is a central repository where all the functions that agents can use are registered.

## Built-in Functions

AxCrew comes with a set of built-in functions that you can use right away:

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

const crew = new AxCrew(configFilePath, AxCrewFunctions);
```

## Creating Custom Functions

To create custom functions, you need to define them according to the AxFunction interface. There are two main approaches:

### 1. Function-based Approach

You can define a function directly:

```typescript
import { AxFunction } from '@ax-llm/ax';
import type { FunctionRegistryType } from '@amitdeshmukh/ax-crew';

const googleSearch: AxFunction = {
  name: 'GoogleSearch',
  description: 'Search Google for information',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The search query' },
      numResults: { type: 'number', description: 'Number of results to return' }
    },
    required: ['query']
  },
  func: async ({ query, numResults = 5 }) => {
    // Implementation for Google search
    const results = await performGoogleSearch(query, numResults);
    return results;
  }
};

// Create a function registry
const myFunctions: FunctionRegistryType = {
  GoogleSearch: googleSearch
};

// Initialize AxCrew with custom functions
const crew = new AxCrew(configFilePath, myFunctions);
```

### 2. Class-based Approach with State Sharing

For more complex functions that need to share state with agents, the class-based approach is recommended:

```typescript
import { AxFunction } from '@ax-llm/ax';
import type { FunctionRegistryType, StateInstance } from '@amitdeshmukh/ax-crew';

class GoogleSearch {
  constructor(private state: StateInstance) {}
  
  toFunction(): AxFunction {
    return {
      name: 'GoogleSearch',
      description: 'Search Google for information',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query' },
          numResults: { type: 'number', description: 'Number of results to return' }
        },
        required: ['query']
      },
      func: async ({ query, numResults = 5 }) => {
        // Access shared state
        const location = this.state.get('location');
        
        // Implementation for Google search, using location from state if available
        const results = await performGoogleSearch(query, numResults, location);
        
        // Update state with search results
        this.state.set('lastSearchResults', results);
        
        return results;
      }
    };
  }
}

// Create a function registry
const myFunctions: FunctionRegistryType = {
  GoogleSearch
};

// Initialize AxCrew with custom functions
const crew = new AxCrew(configFilePath, myFunctions);
```

In this approach:
- The function class receives the agent's state in its constructor
- The `toFunction()` method returns an AxFunction object
- The function can access and modify the shared state

## Function Parameter Schema

The `parameters` field in an AxFunction follows the JSON Schema format:

```typescript
parameters: {
  type: 'object',
  properties: {
    // Define all parameters the function accepts
    param1: { 
      type: 'string', 
      description: 'Description of param1'
    },
    param2: { 
      type: 'number', 
      description: 'Description of param2'
    },
    param3: {
      type: 'array',
      items: { type: 'string' },
      description: 'An array of strings'
    }
  },
  // List all required parameters
  required: ['param1']
}
```

Supported parameter types:
- `string`: Text values
- `number`: Numeric values
- `boolean`: True/false values
- `array`: Lists of values
- `object`: Nested objects

## Example: Creating an API Integration

Here's a complete example of creating a function that integrates with an external API:

```typescript
import fetch from 'node-fetch';
import type { AxFunction } from '@ax-llm/ax';
import type { FunctionRegistryType, StateInstance } from '@amitdeshmukh/ax-crew';

class WeatherAPI {
  private apiKey: string;
  
  constructor(private state: StateInstance) {
    // Get API key from environment variables
    this.apiKey = process.env.WEATHER_API_KEY || '';
  }
  
  toFunction(): AxFunction {
    return {
      name: 'GetWeather',
      description: 'Get current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { 
            type: 'string', 
            description: 'City name or location'
          },
          units: { 
            type: 'string', 
            description: 'Units (metric/imperial)',
            enum: ['metric', 'imperial']
          }
        },
        required: ['location']
      },
      func: async ({ location, units = 'metric' }) => {
        try {
          // API call to weather service
          const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&units=${units}`
          );
          
          if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Store results in state for other agents to use
          this.state.set('lastWeatherQuery', {
            location,
            temperature: data.current.temp_c,
            condition: data.current.condition.text,
            timestamp: new Date().toISOString()
          });
          
          return {
            location: data.location.name,
            temperature: units === 'metric' ? data.current.temp_c : data.current.temp_f,
            units: units === 'metric' ? 'Celsius' : 'Fahrenheit',
            condition: data.current.condition.text,
            humidity: data.current.humidity,
            windSpeed: data.current.wind_kph
          };
        } catch (error) {
          console.error('Weather API error:', error);
          return { error: 'Failed to fetch weather data' };
        }
      }
    };
  }
}

// Create and export the function registry
export const weatherFunctions: FunctionRegistryType = {
  GetWeather: WeatherAPI
};
```

## Combining Multiple Functions

You can combine multiple function sets using object spread:

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';
import { weatherFunctions } from './weather-functions';
import { searchFunctions } from './search-functions';

// Combine built-in and custom functions
const allFunctions = {
  ...AxCrewFunctions,
  ...weatherFunctions,
  ...searchFunctions
};

// Initialize AxCrew with all functions
const crew = new AxCrew(configFilePath, allFunctions);
```

## Best Practices

1. **Clear Documentation**: Provide detailed descriptions for your functions and parameters.
2. **Error Handling**: Implement robust error handling in your functions.
3. **State Management**: Use state to share data between functions and agents.
4. **Security**: Keep API keys and sensitive data in environment variables.
5. **Validation**: Validate inputs before processing to prevent errors.
6. **Performance**: Consider caching results for frequently used queries.
7. **Timeout Handling**: Implement timeouts for external API calls. 