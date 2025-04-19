// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'AxCrew Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/amitdeshmukh/ax-crew' }],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', link: '/' },
						{ label: 'Installation', link: '/guides/getting-started/' },
					],
				},
				{
					label: 'Core Concepts',
					items: [
						{ label: 'Agent Configuration', link: '/guides/agent-configuration/' },
						{ label: 'Creating Custom Functions', link: '/guides/creating-functions/' },
						{ label: 'State Management', link: '/guides/state-management/' },
						{ label: 'Working with Examples', link: '/guides/working-with-examples/' },
					],
				},
				{
					label: 'Advanced Features',
					items: [
						{ label: 'Streaming Responses', link: '/guides/streaming-responses/' },
						{ label: 'Cost Tracking', link: '/guides/cost-tracking/' },
						{ label: 'MCP Integration', link: '/guides/mcp-integration/' },
					],
				},
				{
					label: 'Examples',
					items: [
						{ label: 'Example Use Cases', link: '/guides/examples/' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'AxCrew Class', link: '/reference/axcrew-class/' },
						{ label: 'StatefulAxAgent Class', link: '/reference/stateful-agent/' },
					],
				},
			],
		}),
	],
});
