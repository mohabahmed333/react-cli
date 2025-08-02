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
│   ├── cli/                    # CLI commands and utilities
│   │   ├── commands.ts          # Command definitions
│   │   └── helpers.ts           # Helper functions for CLI
│   │
│   └── generators/              # Code generators
│       ├── componentGenerator.ts # Component generator logic
│       └── pageGenerator.ts      # Page generator logic
│
├── services/                   # Services for business logic
│   ├── aiService.ts             # AI service handling
│   └── userService.ts           # User-related services
│
├── types/                      # Type definitions
│   ├── index.d.ts               # Global type definitions
│   └── aiTypes.d.ts             # AI-specific types
│
└── index.ts                    # Entry point of the application