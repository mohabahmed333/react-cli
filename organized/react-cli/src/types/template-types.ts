src/
├── config/
│   ├── libraryConfig.ts          # Main configuration file for the library
│   └── aiConfig.ts               # AI-specific configuration settings
├── features/
│   ├── ai/
│   │   ├── codeGeneration.ts      # AI code generation logic
│   │   ├── documentation.ts       # AI documentation generation logic
│   │   ├── refactoring.ts         # AI code refactoring logic
│   │   └── testing.ts             # AI test generation logic
│   └── nonAi/
│       ├── featureOne.ts          # Logic for a non-AI feature
│       └── featureTwo.ts          # Logic for another non-AI feature
├── commands/
│   ├── aiCommands.ts              # AI-related CLI commands
│   └── generalCommands.ts         # General CLI commands
├── utils/
│   ├── helpers.ts                 # Helper functions
│   └── validators.ts              # Input validation functions
├── types/
│   ├── aiTypes.ts                 # Type definitions for AI features
│   └── generalTypes.ts            # Type definitions for general features
└── index.ts                       # Entry point for the library