import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile } from '../../utils/file';
import { generateWithGemini } from '../../services/gemini-service';
import { Interface as ReadlineInterface } from 'readline';
import { GenerateOptions } from '../../utils/generateAIHelper';
import { findFoldersByName } from '../../utils/file/findFolderByName';
import { handleInteractiveName } from '../../utils/shared/handleInteractiveName';
import { createFileWithContent } from '../../utils/file/createFileWithContent';
import { handleTargetDirectory } from '../../utils/file/handleTargetDirectory';
import { createGeneratedFile } from '../../utils/file/createGeneratedFile';



export function registerGenerateHook(generate: Command, rl: ReadlineInterface) {
  generate
    .command('hook [name] [folder]')
    .description('Generate a custom React hook (optionally in a specific folder under app/)')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode for hook and folder selection')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = options.useTS ?? config.typescript;

        const hookName = await handleInteractiveName(
          rl,
          name,
          'hook',
          {
            pattern: /^use[A-Z][a-zA-Z0-9]*$/,
            defaultValue: "❌ Hook name must start with 'use' and be camelCase (e.g., useMyFeature)"
          }
        );

        const targetDir = await handleTargetDirectory(
          rl,
          config,
          folder,
          'hooks',
          options.interactive ?? false
        );

        const defaultContent = useTS
          ? `import { useState } from 'react';\n\nexport const ${hookName} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
          : `import { useState } from 'react';\n\nexport const ${hookName} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;

        await createGeneratedFile(
          {
            rl,
            config,
            type: 'hook',
            name: hookName,
            targetDir,
            useTS,
            replace: options.replace ?? false,
            defaultContent,
            aiOptions: { features: ``, additionalPrompt: `Create a React hook named ${hookName} in ${useTS ? 'TypeScript' : 'JavaScript'} with JSDoc comments.` }
          }
        );
      } catch (error) {
        console.error(chalk.red('❌ Error generating hook:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}