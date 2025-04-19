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
						{ label: 'Installation', link: '/getting-started/' },
					],
				},
				{
					label: 'Core Concepts',
					items: [
						{ label: 'Agent Configuration', link: '/core-concepts/agent-configuration/' },
						{ label: 'Creating Custom Functions', link: '/core-concepts/creating-functions/' },
						{ label: 'State Management', link: '/core-concepts/state-management/' },
						{ label: 'Working with Examples', link: '/core-concepts/working-with-examples/' },
					],
				},
				{
					label: 'Advanced Features',
					items: [
						{ label: 'Streaming Responses', link: '/advanced-features/streaming-responses/' },
						{ label: 'Cost Tracking', link: '/advanced-features/cost-tracking/' },
						{ label: 'MCP Integration', link: '/advanced-features/mcp-integration/' },
					],
				},
				{
					label: 'Examples',
					items: [
						{ label: 'Example Use Cases', link: '/examples/examples/' },
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
