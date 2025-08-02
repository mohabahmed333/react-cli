src/
├── config/
│   ├── libraryConfig.ts          # Configuration settings for the library
│   └── index.ts                  # Entry point for configuration exports
├── features/
│   ├── ai/
│   │   ├── index.ts              # Entry point for AI features
│   │   ├── codeGeneration.ts      # AI code generation logic
│   │   ├── documentation.ts       # AI documentation generation logic
│   │   ├── refactoring.ts         # AI code refactoring logic
│   │   └── testing.ts             # AI test generation logic
│   └── otherFeature/
│       ├── index.ts              # Entry point for other features
│       └── otherFeatureLogic.ts   # Logic for other features
├── commands/
│   ├── aiCommands.ts              # AI-related CLI commands
│   ├── otherCommands.ts           # Other CLI commands
│   └── index.ts                   # Entry point for command exports
├── utils/
│   ├── helpers.ts                 # Helper functions
│   └── validators.ts              # Validation functions
├── types/
│   ├── aiTypes.ts                 # Type definitions for AI features
│   └── otherTypes.ts              # Type definitions for other features
└── index.ts                       # Main entry point for the library