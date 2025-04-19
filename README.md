# AxCrew Documentation

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

This documentation site for [AxCrew](https://github.com/amitdeshmukh/ax-crew) is built using [Astro Starlight](https://starlight.astro.build), a documentation framework based on Astro.

## 🚀 Project Structure

Inside this documentation project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/            # Images and other assets
│   ├── content/
│   │   ├── docs/          # Documentation markdown files
│   └── content.config.ts  # Content configuration
├── astro.config.mjs       # Astro configuration with Starlight integration
├── package.json
└── tsconfig.json
```

Documentation files are in `.md` or `.mdx` format in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 📚 Documentation Structure

The documentation is organized into the following sections:

- **Getting Started** - Installation and basic setup
- **Core Concepts** - Agent configuration, crew configuration, functions, and state management
- **Advanced Features** - Streaming responses, cost tracking, and MCP integration
- **Examples** - Example use cases
- **API Reference** - Detailed API documentation

## 🔗 Useful Links

- [AxCrew GitHub Repository](https://github.com/amitdeshmukh/ax-crew)
- [Starlight Documentation](https://starlight.astro.build/)
- [Astro Documentation](https://docs.astro.build)
