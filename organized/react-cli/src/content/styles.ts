src/
├── config/
│   ├── libraryConfig.ts          # Configuration for library features
│   └── index.ts                  # Entry point for configuration exports
├── features/
│   ├── ai/
│   │   ├── codeGeneration.ts      # AI code generation logic
│   │   ├── documentation.ts        # AI documentation generation logic
│   │   ├── refactoring.ts          # AI code refactoring logic
│   │   └── testing.ts              # AI test generation logic
│   └── index.ts                   # Entry point for feature exports
├── cli/
│   ├── commands/
│   │   ├── aiCommands.ts          # AI-related CLI commands
│   │   ├── generalCommands.ts      # General CLI commands
│   │   └── index.ts               # Entry point for command exports
│   ├── helpers/
│   │   ├── cliHelper.ts           # Helper functions for CLI
│   │   └── index.ts               # Entry point for helper exports
│   └── index.ts                   # Entry point for CLI exports
├── utils/
│   ├── logger.ts                  # Logging utility
│   ├── validator.ts               # Input validation utility
│   └── index.ts                   # Entry point for utility exports
├── index.ts                       # Main entry point for the library
└── types/
    ├── aiTypes.ts                 # Type definitions for AI features
    ├── cliTypes.ts                # Type definitions for CLI commands
    └── index.ts                   # Entry point for type exports