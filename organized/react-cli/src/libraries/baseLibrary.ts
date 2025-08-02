src/
│
├── config/                     # Configuration files
│   ├── libraryConfig.ts        # Main library configuration
│   └── aiConfig.ts             # AI-specific configurations
│
├── features/                   # Feature modules
│   ├── ai/                     # AI-related features
│   │   ├── codeGeneration.ts    # Code generation logic
│   │   ├── documentation.ts      # Documentation generation logic
│   │   ├── refactoring.ts        # Refactoring logic
│   │   └── testing.ts           # Testing logic
│   │
│   ├── cli/                    # CLI commands
│   │   ├── commands.ts          # Command definitions
│   │   └── help.ts              # Help command logic
│   │
│   └── generators/             # Code generators
│       ├── componentGenerator.ts # Component generator logic
│       └── pageGenerator.ts      # Page generator logic
│
├── utils/                      # Utility functions
│   ├── logger.ts                # Logging utility
│   └── validator.ts             # Validation utility
│
├── types/                      # Type definitions
│   ├── index.d.ts               # Global type definitions
│   └── aiTypes.d.ts             # AI-related type definitions
│
└── index.ts                    # Entry point of the application