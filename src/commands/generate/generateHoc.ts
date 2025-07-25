import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { findFoldersByName } from '../../utils/file/findFolderByName';
import { handleInteractiveName } from '../../utils/shared/handleInteractiveName';
import { handleTargetDirectory } from '../../utils/file/handleTargetDirectory';
import { createGeneratedFile } from '../../utils/file/createGeneratedFile';
import { GenerateOptions } from '../../utils/generateAIHelper';
import { Interface as ReadlineInterface } from 'readline';

export function registerGenerateHoc(generate: Command, rl: ReadlineInterface) {
  generate
    .command('hoc [name] [folder]')
    .description('Generate a higher-order component (optionally in a specific folder under app/)')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode for HOC and folder selection')
    .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = config.typescript;

        const hocName = await handleInteractiveName(
          rl,
          name,
          'hoc',
         {
            pattern: /^[A-Z][a-zA-Z0-9]*$/,
            patternError: "❌ HOC name must be PascalCase and start with a capital letter"
         }
        );

        const targetDir = await handleTargetDirectory(
          rl,
          config,
          folder,
          'hocs',
          options.interactive ?? false
        );

        const defaultContent = useTS
          ? `import React from 'react';\n\nexport function with${hocName}<P extends object>(\n  WrappedComponent: React.ComponentType<P>\n) {\n  const ComponentWith${hocName} = (props: P) => {\n    // Add your HOC logic here\n    return <WrappedComponent {...props} />;\n  };\n\n  return ComponentWith${hocName};\n}\n`
          : `import React from 'react';\n\nexport function with${hocName}(WrappedComponent) {\n  return function ComponentWith${hocName}(props) {\n    // Add your HOC logic here\n    return <WrappedComponent {...props} />;\n  };\n}\n`;

        await createGeneratedFile({
          rl,
          config,
          type: 'hoc',
          name: hocName,
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent,
          aiOptions: {
            features: '',
            additionalPrompt: `Create a React higher-order component named with${hocName} in ${useTS ? 'TypeScript' : 'JavaScript'} with JSDoc comments.`
          }
        });
      } catch (error) {
        console.error(chalk.red('❌ Error generating HOC:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}