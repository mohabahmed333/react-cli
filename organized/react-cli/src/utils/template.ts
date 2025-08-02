src/
│
├── config/
│   ├── libraryConfig.ts          # Main configuration file for the library
│   └── featureToggles.ts         # Feature toggle configurations
│
├── features/
│   ├── ai/
│   │   ├── codeGeneration.ts      # AI code generation logic
│   │   ├── documentation.ts        # AI documentation generation logic
│   │   ├── refactoring.ts          # AI code refactoring logic
│   │   └── testing.ts              # AI test generation logic
│   │
│   └── nonAi/
│       ├── featureOne.ts          # Logic for non-AI feature one
│       └── featureTwo.ts          # Logic for non-AI feature two
│
├── commands/
│   ├── aiCommands.ts              # AI-related CLI commands
│   └── generalCommands.ts         # General CLI commands
│
├── utils/
│   ├── logger.ts                  # Logging utility
│   └── helpers.ts                 # Helper functions
│
├── types/
│   ├── aiTypes.ts                 # Type definitions for AI features
│   └── generalTypes.ts            # Type definitions for general features
│
└── index.ts                       # Entry point for the library