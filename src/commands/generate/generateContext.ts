import { Command } from 'commander';
import chalk from 'chalk';
import { setupConfiguration } from '../../utils/config/config';
import { Interface as ReadlineInterface } from 'readline';
import { GenerateOptions } from '../../utils/ai/generateAIHelper';
import { handleInteractiveName } from '../../utils/shared/handleInteractiveName';
import { createGeneratedFile } from '../../utils/createGeneratedFile/createGeneratedFile';

export function registerGenerateContext(generate: Command, rl: ReadlineInterface) {
  generate
    .command('context [name]')
    .description('Generate a React context')
    .option('--ts', 'Override TypeScript setting')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode for context name input')
    .action(async (name: string | undefined, options: GenerateOptions) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = options.useTS ?? config.typescript;

        const contextName = await handleInteractiveName(
          rl,
          name, 
          'context',
          {
            pattern: /^[A-Z][a-zA-Z0-9]*$/,
            patternError: "❌ Context name must be PascalCase and start with a capital letter"
          }
         );

        const targetDir = `${config.baseDir}/contexts`;

        const defaultContent = useTS
          ? `import React, { createContext, useContext, useState, ReactNode } from 'react';\n\ninterface ${contextName}ContextProps {\n  children: ReactNode;\n}\n\ninterface ${contextName}ContextType {\n  // Add your context value types here\n}\n\nconst ${contextName}Context = createContext<${contextName}ContextType | undefined>(undefined);\n\nexport const ${contextName}Provider = ({ children }: ${contextName}ContextProps) => {\n  // const [value, setValue] = useState();\n  return (\n    <${contextName}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${contextName}Context.Provider>\n  );\n};\n\nexport const use${contextName} = () => {\n  const context = useContext(${contextName}Context);\n  if (!context) throw new Error('use${contextName} must be used within a ${contextName}Provider');\n  return context;\n};\n`
          : `import React, { createContext, useContext, useState } from 'react';\n\nconst ${contextName}Context = createContext(undefined);\n\nexport const ${contextName}Provider = ({ children }) => {\n  // const [value, setValue] = useState();\n  return (\n    <${contextName}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${contextName}Context.Provider>\n  );\n};\n\nexport const use${contextName} = () => {\n  const context = useContext(${contextName}Context);\n  if (!context) throw new Error('use${contextName} must be used within a ${contextName}Provider');\n  return context;\n};\n`;

        await createGeneratedFile({
          rl,
          config,
          type: 'context',
          name: contextName,
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent,
          aiOptions: {
            features: '',
            additionalPrompt: `Create a React context named ${contextName}Context with provider and custom hook in ${useTS ? 'TypeScript' : 'JavaScript'}. Include proper typing and error handling.`
          }
        });
      } catch (error) {
        console.error(chalk.red('❌ Error generating context:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}