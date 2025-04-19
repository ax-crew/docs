---
title: Example Use Cases
description: Explore examples of how to use AxCrew in different scenarios
---

# Example Use Cases

This page showcases various examples of how to use AxCrew in different scenarios.

## Basic Researcher-Writer

This example demonstrates how to create a simple crew with two agents: a researcher that finds information and a writer that creates content based on the research.

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

// Define the crew configuration
const config = {
  crew: [
    {
      name: "Researcher",
      description: "Finds and summarizes information on a topic",
      signature: "topic:string \"the topic to research\" -> research:string \"summarized research findings\"",
      provider: "openai",
      providerKeyName: "OPENAI_API_KEY",
      ai: {
        model: "gpt-4",
        temperature: 0.2
      }
    },
    {
      name: "Writer",
      description: "Creates content based on research findings",
      signature: "topic:string \"the content topic\", research:string \"research findings\" -> content:string \"written content\"",
      provider: "anthropic",
      providerKeyName: "ANTHROPIC_API_KEY",
      ai: {
        model: "claude-3-sonnet",
        temperature: 0.7
      },
      agents: ["Researcher"]
    }
  ]
};

// Initialize the crew
const crew = new AxCrew(config, AxCrewFunctions);
await crew.addAllAgents();

// Get agents
const researcher = crew.agents.get("Researcher");
const writer = crew.agents.get("Writer");

// Run the workflow
const topic = "The history of artificial intelligence";

// Option 1: Run agents separately
const researchResults = await researcher.forward({ topic });
console.log("Research completed:", researchResults.research.slice(0, 100) + "...");

const content = await writer.forward({ 
  topic, 
  research: researchResults.research 
});
console.log("Content created:", content.content.slice(0, 100) + "...");

// Option 2: Use dependent agent directly (Writer will automatically use Researcher)
const directContent = await writer.forward({ topic });
console.log("Content created directly:", directContent.content.slice(0, 100) + "...");

// Check costs
const costs = crew.getAggregatedCosts();
console.log(`Total cost: $${costs.totalCost}`);
```

## Math Problem Solver

This example shows a specialized agent for solving math problems with step-by-step explanations.

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

// Define the crew configuration
const config = {
  crew: [
    {
      name: "MathSolver",
      description: "Solves math problems with detailed step-by-step explanations",
      signature: "problem:string \"math problem to solve\" -> solution:string \"step-by-step solution with final answer\"",
      provider: "google-gemini",
      providerKeyName: "GEMINI_API_KEY",
      ai: {
        model: "gemini-1.5-pro",
        temperature": 0
      },
      examples: [
        {
          problem: "Calculate the compound interest on $5000 invested for 3 years at an annual rate of 8% compounded quarterly.",
          solution: "To solve this compound interest problem, I'll use the formula:\nA = P(1 + r/n)^(nt)\n\nWhere:\n- A = final amount\n- P = principal (initial investment)\n- r = annual interest rate (decimal)\n- n = number of times compounded per year\n- t = time in years\n\nGiven:\n- P = $5000\n- r = 8% = 0.08\n- n = 4 (quarterly)\n- t = 3 years\n\nSubstituting into the formula:\nA = $5000(1 + 0.08/4)^(4×3)\nA = $5000(1 + 0.02)^12\nA = $5000(1.02)^12\nA = $5000 × 1.26824\nA = $6,341.20\n\nTherefore, the final amount after 3 years is $6,341.20, and the compound interest earned is $6,341.20 - $5000 = $1,341.20."
        }
      ]
    }
  ]
};

// Initialize the crew
const crew = new AxCrew(config, AxCrewFunctions);
await crew.addAllAgents();

// Get the math solver agent
const mathSolver = crew.agents.get("MathSolver");

// Solve a problem
const problem = "If a rectangle has a length of 12 cm and a width of 8 cm, what is its area and perimeter?";
const solution = await mathSolver.forward({ problem });

console.log("Problem:", problem);
console.log("\nSolution:", solution.solution);

// Check the token usage and cost
const cost = mathSolver.getLastUsageCost();
console.log(`\nTokens used: ${cost.tokenMetrics.totalTokens}`);
console.log(`Cost: $${cost.totalCost}`);
```

## Multi-agent Travel Planner

This example demonstrates a more complex crew with multiple agents working together to create a travel plan.

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

// Define the crew configuration
const config = {
  crew: [
    {
      name: "DestinationResearcher",
      description: "Researches travel destinations and attractions",
      signature: "destination:string \"travel destination\" -> attractions:string[] \"top attractions\", details:string \"destination details\"",
      provider: "openai",
      providerKeyName: "OPENAI_API_KEY",
      ai: {
        model: "gpt-3.5-turbo",
        temperature": 0.3
      }
    },
    {
      name: "AccommodationPlanner",
      description: "Recommends accommodation options",
      signature: "destination:string \"travel destination\", budget:number \"daily budget in USD\" -> accommodations:string[] \"recommended accommodations\"",
      provider: "google-gemini",
      providerKeyName: "GEMINI_API_KEY",
      ai: {
        model: "gemini-1.5-flash",
        temperature": 0.2
      }
    },
    {
      name: "ItineraryCreator",
      description: "Creates a detailed travel itinerary",
      signature: "destination:string \"travel destination\", days:number \"number of days\", attractions:string[] \"top attractions\", accommodations:string[] \"accommodation options\" -> itinerary:string \"detailed day-by-day itinerary\"",
      provider: "anthropic",
      providerKeyName: "ANTHROPIC_API_KEY",
      ai: {
        model: "claude-3-haiku",
        temperature": 0.5
      },
      agents: ["DestinationResearcher", "AccommodationPlanner"]
    }
  ]
};

// Initialize the crew
const crew = new AxCrew(config, AxCrewFunctions);
await crew.addAllAgents();

// Set up travel parameters
const destination = "Kyoto, Japan";
const days = 4;
const budget = 150; // USD per night

// Store initial data in state
crew.state.set('travel.destination', destination);
crew.state.set('travel.days', days);
crew.state.set('travel.budget', budget);

// Get agents
const destinationResearcher = crew.agents.get("DestinationResearcher");
const accommodationPlanner = crew.agents.get("AccommodationPlanner");
const itineraryCreator = crew.agents.get("ItineraryCreator");

// Get destination information with streaming
console.log("Researching destination...");
let research = await destinationResearcher.forward(
  { destination },
  {
    onStream: (chunk) => process.stdout.write('.')
  }
);
console.log("\nResearch complete!");

// Store research in state
crew.state.set('travel.attractions', research.attractions);
crew.state.set('travel.details', research.details);

// Get accommodation recommendations
console.log("\nFinding accommodations...");
const accommodations = await accommodationPlanner.forward({ 
  destination, 
  budget 
});
console.log("Accommodations found!");

// Store accommodations in state
crew.state.set('travel.accommodations', accommodations.accommodations);

// Create the itinerary (this will use both previous agents)
console.log("\nCreating itinerary...");
const itinerary = await itineraryCreator.forward({ 
  destination,
  days,
  attractions: crew.state.get('travel.attractions'),
  accommodations: crew.state.get('travel.accommodations')
});

// Print the final itinerary
console.log("\n==== KYOTO TRAVEL ITINERARY ====\n");
console.log(itinerary.itinerary);

// Display cost information
const costs = crew.getAggregatedCosts();
console.log("\n==== COST INFORMATION ====");
console.log(`Total tokens: ${costs.aggregatedMetrics.totalTokens}`);
console.log(`Total cost: $${costs.totalCost}`);
```

## Content Generation with MCP

This example shows how to use the Model Context Protocol (MCP) to integrate with external services for content generation.

```typescript
import { AxCrew, AxCrewFunctions } from '@amitdeshmukh/ax-crew';

// Define the crew configuration
const config = {
  crew: [
    {
      name: "WebResearcher",
      description: "Researches information on the web",
      signature: "topic:string \"research topic\" -> findings:string \"research findings with sources\"",
      provider: "anthropic",
      providerKeyName: "ANTHROPIC_API_KEY",
      ai: {
        model: "claude-3-sonnet",
        temperature": 0
      },
      options: {
        mcp: {
          enabled: true,
          server: "web-search",
          serverOptions: {
            apiKey: "SEARCH_API_KEY"
          }
        }
      }
    },
    {
      name: "ContentCreator",
      description: "Creates blog content based on research",
      signature: "topic:string \"blog topic\", findings:string \"research findings\" -> title:string \"blog title\", content:string \"blog content with sections\"",
      provider: "openai",
      providerKeyName: "OPENAI_API_KEY",
      ai: {
        model: "gpt-4",
        temperature": 0.7
      },
      agents: ["WebResearcher"]
    }
  ]
};

// Initialize the crew
const crew = new AxCrew(config, AxCrewFunctions);
await crew.addAllAgents();

// Create content with up-to-date information
const topic = "Latest developments in quantum computing";
const contentCreator = crew.agents.get("ContentCreator");

// Set starting timestamp
const startTime = new Date();
crew.state.set('blog.startTime', startTime.toISOString());

// Generate content (WebResearcher will be automatically used through MCP)
console.log(`Generating content on: ${topic}`);
console.log("This may take a minute as it involves web research...");

const blogPost = await contentCreator.forward({ topic });

// Print the result
console.log("\n==== BLOG POST ====\n");
console.log(`Title: ${blogPost.title}\n`);
console.log(blogPost.content);

// Log timing and cost info
const endTime = new Date();
const duration = (endTime.getTime() - startTime.getTime()) / 1000;
const costs = crew.getAggregatedCosts();

console.log("\n==== CONTENT GENERATION STATS ====");
console.log(`Time taken: ${duration.toFixed(2)} seconds`);
console.log(`Total tokens: ${costs.aggregatedMetrics.totalTokens}`);
console.log(`Total cost: $${costs.totalCost}`);
```

## More Examples

For more complete examples, check out the [examples directory](https://github.com/amitdeshmukh/ax-crew/tree/main/examples) in the AxCrew repository, which includes:

- WordPress integration for posting content
- Math problem solvers with step-by-step explanations
- Google Maps integration using MCP
- And more

You can also contribute your own examples by submitting a pull request to the repository. 