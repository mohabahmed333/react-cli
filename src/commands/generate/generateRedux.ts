import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { handleInteractiveName } from '../../utils/shared/handleInteractiveName';
import { handleTargetDirectory } from '../../utils/file/handleTargetDirectory';
import { createGeneratedFile } from '../../utils/file/createGeneratedFile';
import { GenerateOptions } from '../../utils/generateAIHelper';
import { Interface as ReadlineInterface } from 'readline';

interface ReduxOptions extends GenerateOptions {
  ts?: boolean;
  interactive?: boolean;
  replace?: boolean;
  ai?: boolean;
}

export function registerGenerateRedux(generate: Command, rl: ReadlineInterface) {
  generate
    .command('redux [name] [folder]')
    .description('Generate a Redux slice (optionally in a specific folder under app/)')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode for redux and folder selection')
    .option('--replace', 'Replace file if it exists')
    .option('--ai', 'Use AI to generate the Redux slice code')
    .action(async (name: string | undefined, folder: string | undefined, options: ReduxOptions) => {
      try {
        console.log(chalk.cyan('\n📦 Redux Slice Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        const useTS = options.ts ?? config.typescript;

        // Handle redux slice name
        const reduxName = await handleInteractiveName(
          rl,
          name,
          'redux',
          {
            pattern: /^[A-Z][a-zA-Z0-9]*$/,
            patternError: "❌ Redux slice name must be PascalCase and start with a capital letter"
          },
        );

        // Handle target directory
        const targetDir = await handleTargetDirectory(
          rl,
          config,
          folder,
          'store',
          options.interactive ?? false
        );

        // Handle interactive options
        if (options.interactive && config.aiEnabled) {
          const useAI = await askQuestion(
            rl,
            chalk.blue('Use AI to generate code? (y/n): ')
          );
          options.ai = useAI.toLowerCase() === 'y';

          if (options.ai) {
            options.aiFeatures = await askQuestion(
              rl,
              chalk.blue('Describe the state and actions needed (e.g., "user authentication state with login/logout actions"): ')
            );
          }
        }

        const defaultContent = useTS
          ? `import { createSlice, PayloadAction } from '@reduxjs/toolkit';\n\ninterface ${reduxName}State {\n  // Add your state properties here\n}\n\nconst initialState: ${reduxName}State = {\n  // Initial state values\n};\n\nconst ${reduxName}Slice = createSlice({\n  name: '${reduxName.toLowerCase()}',\n  initialState,\n  reducers: {\n    // Add your reducers here\n    exampleReducer(state, action: PayloadAction<string>) {\n      // reducer logic\n    }\n  },\n});\n\nexport const { actions, reducer } = ${reduxName}Slice;\nexport default ${reduxName}Slice.reducer;\n`
          : `import { createSlice } from '@reduxjs/toolkit';\n\nconst initialState = {\n  // Initial state values\n};\n\nconst ${reduxName}Slice = createSlice({\n  name: '${reduxName.toLowerCase()}',\n  initialState,\n  reducers: {\n    // Add your reducers here\n    exampleReducer(state, action) {\n      // reducer logic\n    }\n  },\n});\n\nexport const { actions, reducer } = ${reduxName}Slice;\nexport default ${reduxName}Slice.reducer;\n`;

        await createGeneratedFile({
          rl,
          config,
          type: 'redux',
          name: reduxName,
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent,
          aiOptions: options.ai ? {
            features: options.aiFeatures,
            additionalPrompt: `Create a Redux slice named ${reduxName} in ${useTS ? 'TypeScript' : 'JavaScript'} with proper typing and common patterns.`
          } : undefined
        });

        console.log(chalk.green(`✅ Successfully generated ${reduxName} Redux slice`));
      } catch (error) {
        console.error(chalk.red('❌ Error generating Redux slice:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}