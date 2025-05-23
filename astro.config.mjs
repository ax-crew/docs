// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import catppuccin from "@catppuccin/starlight";

import umami from "@yeskunall/astro-umami";

// https://astro.build/config
export default defineConfig({
  site: "https://axcrew.dev",
  integrations: [
    starlight({
      title: "AxCrew",
      logo: {
        src: "./src/assets/houston.webp",
      },
      description:
        "A framework for building and managing crews of AI agents with AxLLM",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/amitdeshmukh/ax-crew",
        },
        { icon: "x.com", label: "X", href: "https://twitter.com/amitdeshmukh" },
        {
          icon: "linkedin",
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/amitdeshmukh/",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", link: "/" },
            { label: "Installation", link: "/getting-started/" },
          ],
        },
        {
          label: "Core Concepts",
          items: [
            {
              label: "Agent Configuration",
              link: "/core-concepts/agent-configuration/",
            },
            {
              label: "Crew Configuration",
              link: "/core-concepts/crew-configuration/",
            },
            {
              label: "Functions (aka Tools)",
              link: "/core-concepts/creating-functions/",
            },
            {
              label: "State Management",
              link: "/core-concepts/state-management/",
            },
            {
              label: "Working with Examples",
              link: "/core-concepts/working-with-examples/",
            },
          ],
        },
        {
          label: "Advanced Features",
          items: [
            {
              label: "Streaming Responses",
              link: "/advanced-features/streaming-responses/",
            },
            {
              label: "Cost Tracking",
              link: "/advanced-features/cost-tracking/",
            },
            {
              label: "MCP Integration",
              link: "/advanced-features/mcp-integration/",
            },
          ],
        },
        {
          label: "Examples",
          items: [{ label: "Use Cases", link: "/examples/examples/" }],
        },
        {
          label: "Curated Tools",
          items: [{ label: "MCP Servers", link: "/curated-tools/#mcp-servers/" }, { label: "AxFunctions", link: "/curated-tools/#axfunctions/" }],
        },
        {
          label: "API Reference",
          items: [
            { label: "AxCrew Class", link: "/reference/axcrew-class/" },
            {
              label: "StatefulAxAgent Class",
              link: "/reference/stateful-agent/",
            },
          ],
        },
      ],
      plugins: [
        catppuccin({
          light: { flavor: "latte", accent: "mauve" },
          dark: { flavor: "frappe", accent: "mauve" },
        }),
      ],
    }),
    umami({
      id: "11bae7ee-ea6d-4b0c-a8e3-cdc393be0c30",
    }),
  ],
});