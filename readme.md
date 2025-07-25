# React CLI

A CLI tool for React/Next.js project scaffolding with Vite support.

## Features

- Project scaffolding for React and Next.js
- TypeScript support
- Component generation
- Hook generation
- Service generation
- Accessibility scanning
- Bundle analysis
- AI-powered code generation (using Google's Gemini)

## Installation

```bash
npm install -g react-cli
```

## Usage

```bash
create-page <command> [options]
```

## AI Features

The CLI includes AI-powered code generation using Google's Gemini. To use these features:

1. Get a Gemini API key from https://aistudio.google.com/app/apikey
2. Create a `.env` file in your project root with:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Enable AI features during CLI setup or by running:
   ```bash
   create-page init
   ```

AI Commands:
- `create-page ai <prompt>` - Generate code using AI
- `create-page ai-enhance <file>` - Improve existing file with AI
- `create-page ai-docs <file>` - Generate documentation with AI

The free tier of Gemini API has a limit of 60 requests per minute.

## Commands

Run `create-page help` for a full list of commands and options.

## License

MIT