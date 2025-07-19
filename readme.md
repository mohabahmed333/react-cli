# React CLI (TypeScript)

A simple CLI tool to scaffold React/Next.js project resources: hooks, utils, types, pages, and more. Written in TypeScript for maintainability and type safety.

## Features
- Create custom hooks, utility functions, and TypeScript types
- Scaffold pages with options for CSS modules, tests, components, and more
- Interactive and non-interactive modes
- Supports React and Next.js projects
- Configuration stored in `create.config.json`

## Usage

### Install dependencies
```
npm install
```

### Build the CLI
```
npm run build
```

### Run the CLI
```
node dist/index.js <command> [...options]
```

Or add a bin entry in `package.json` for global/local usage.

### Example commands
```
node dist/index.js hook useAuth --ts
node dist/index.js util formatString
node dist/index.js type User --ts
node dist/index.js page Dashboard --css --test --interactive
node dist/index.js global --interactive
```

## Project Structure
```
react-cli/
  src/
    commands/      # Command handlers (hook, util, type, global, page, config, help)
    utils/         # Utility functions (file, prompt, config)
    index.ts       # CLI entry point
  dist/            # Compiled JS output
  package.json
  tsconfig.json
  README.md
```

## Development
- Edit TypeScript files in `src/`
- Run `npm run build` to compile
- Run CLI with `node dist/index.js ...`

---
MIT License