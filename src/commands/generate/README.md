# How to Add a New `g` (generate) Command

This guide explains how to add a new generator subcommand to the CLI's `g` (generate) command, following the interactive and scalable pattern used for type, util, component, hook, page, and context.

## 1. Create Your Generator File
- Place your file in `src/commands/generate/`.
- Export a function: `registerGenerateYourFeature(generate: Command, rl: any)`.
- Use the following template:

```ts
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile } from '../../utils/file';

function findFoldersByName(baseDir: string, folderName: string): string[] {
  // ... (see other generators for implementation)
}

export function registerGenerateYourFeature(generate: Command, rl: any) {
  generate
    .command('yourfeature [name] [folder]')
    .description('Generate a ... (optionally in a specific folder under app/)')
    .option('-i, --interactive', 'Use interactive mode for name and folder selection')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string | undefined, folder: string | undefined, options: any) => {
      // 1. Setup config and prompt for name if -i
      // 2. Validate name
      // 3. Ask if user wants to add to a specific folder under app/
      // 4. If yes, prompt for folder name, search, select/create as needed
      // 5. If no, use default directory
      // 6. Create the file(s) with error handling
    });
}
```

## 2. Register Your Generator
- In `src/commands/generate.ts`, import and call your register function:
  ```ts
  import { registerGenerateYourFeature } from './generateYourFeature';
  // ...
  registerGenerateYourFeature(generate, rl);
  ```

## 3. Best Practices
- Use interactive mode (`-i`) for a guided, user-friendly experience.
- Validate names (PascalCase, camelCase, etc.) as appropriate.
- Use the `findFoldersByName` helper to allow searching for folders under `app/`.
- Always provide clear error messages and prompts.
- Default to a logical directory if the user does not specify a folder.
- Follow the code style and UX of existing generators for consistency.

## 4. Example
See `generateType.ts`, `generateUtil.ts`, `generateComponent.ts`, `generateHook.ts`, `generatePage.ts`, or `generateContext.ts` for real-world examples.

---

By following this pattern, you ensure all generators are consistent, scalable, and easy for users and contributors alike! 