src/
│
├── config/
│   ├── libraryConfig.ts          # Main configuration file for the library
│   └── index.ts                  # Exports all configurations
│
├── features/
│   ├── ai/
│   │   ├── codeGeneration.ts      # AI code generation logic
│   │   ├── documentation.ts        # AI documentation generation logic
│   │   ├── refactoring.ts          # AI code refactoring logic
│   │   └── testing.ts              # AI test generation logic
│   │
│   ├── cli/
│   │   ├── commands.ts            # CLI command definitions
│   │   ├── options.ts             # CLI options and flags
│   │   └── help.ts                # Help text and documentation for CLI
│   │
│   └── index.ts                   # Exports all feature modules
│
├── utils/
│   ├── logger.ts                  # Logging utility
│   ├── errorHandler.ts            # Error handling utility
│   └── index.ts                   # Exports all utility functions
│
├── types/
│   ├── aiFeatures.ts              # Type definitions for AI features
│   ├── cliOptions.ts              # Type definitions for CLI options
│   └── index.ts                   # Exports all type definitions
│
└── index.ts                       # Main entry point for the library