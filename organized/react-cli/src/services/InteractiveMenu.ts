src/
├── config/
│   ├── libraryConfig.ts          # Configuration for library features
│   └── aiConfig.ts               # Configuration for AI-related settings
├── features/
│   ├── ai/
│   │   ├── codeGeneration.ts      # AI code generation logic
│   │   ├── documentation.ts        # AI documentation generation logic
│   │   ├── refactoring.ts          # AI code refactoring logic
│   │   └── testing.ts              # AI test generation logic
│   └── nonAi/
│       ├── featureOne.ts          # Logic for non-AI feature one
│       └── featureTwo.ts          # Logic for non-AI feature two
├── commands/
│   ├── aiCommands.ts              # AI-related CLI commands
│   └── generalCommands.ts          # General CLI commands
├── utils/
│   ├── helpers.ts                 # Helper functions
│   └── validators.ts              # Validation functions
├── types/
│   ├── aiTypes.ts                 # Type definitions for AI features
│   └── generalTypes.ts            # Type definitions for general features
└── index.ts                       # Entry point for the library