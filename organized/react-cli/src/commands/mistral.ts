src/
│
├── config/                     # Configuration files
│   ├── libraryConfig.ts        # Main library configuration
│   └── ...                     # Other configuration files
│
├── features/                   # Feature modules
│   ├── ai/                     # AI-related features
│   │   ├── index.ts            # Entry point for AI features
│   │   ├── codeGeneration.ts    # AI code generation logic
│   │   ├── documentation.ts      # AI documentation generation logic
│   │   ├── refactoring.ts        # AI code refactoring logic
│   │   └── testing.ts            # AI test generation logic
│   │
│   └── ...                     # Other feature modules
│
├── commands/                   # CLI commands
│   ├── aiCommands.ts           # AI-related CLI commands
│   ├── userCommands.ts         # User-related CLI commands
│   └── ...                     # Other command files
│
├── utils/                      # Utility functions
│   ├── logger.ts               # Logging utility
│   ├── helpers.ts              # General helper functions
│   └── ...                     # Other utility files
│
├── types/                      # Type definitions
│   ├── index.d.ts              # Main type definitions
│   └── ...                     # Other type definition files
│
└── index.ts                    # Main entry point for the library