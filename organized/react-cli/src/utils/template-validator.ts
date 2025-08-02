src/
│
├── config/
│   ├── index.ts                # Main configuration export
│   └── libraryConfig.ts        # Library configuration settings
│
├── features/
│   ├── ai/
│   │   ├── index.ts            # Main AI feature export
│   │   ├── codeGeneration.ts    # AI code generation logic
│   │   ├── documentation.ts      # AI documentation generation logic
│   │   ├── refactoring.ts        # AI code refactoring logic
│   │   └── testing.ts            # AI test generation logic
│   │
│   └── otherFeature/
│       ├── index.ts            # Main export for other features
│       └── otherFeatureLogic.ts # Logic for other features
│
├── commands/
│   ├── index.ts                # Main command export
│   └── aiCommands.ts           # AI-related commands
│
├── utils/
│   ├── index.ts                # Utility functions
│   └── helperFunctions.ts       # Helper functions for various tasks
│
├── types/
│   ├── index.ts                # Main type definitions
│   └── aiTypes.ts              # Type definitions specific to AI features
│
└── index.ts                    # Entry point for the library