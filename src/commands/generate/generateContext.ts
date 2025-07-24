import { Command } from 'commander';
import chalk from 'chalk';
import { setupConfiguration } from '../../utils/config';
import { createFile, createFolder } from '../../utils/file';

export function registerGenerateContext(generate: Command, rl: any) {
  generate
    .command('context <name>')
    .description('Generate a React context')
    .option('--ts', 'Override TypeScript setting')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      const ext = useTS ? 'tsx' : 'jsx';
      const folderPath = `${config.baseDir}/contexts`;
      createFolder(folderPath);
      const filePath = `${folderPath}/${name}Context.${ext}`;
      const content = useTS
        ? `import React, { createContext, useContext, useState, ReactNode } from 'react';\n\ninterface ${name}ContextProps {\n  children: ReactNode;\n}\n\ninterface ${name}ContextType {\n  // Add your context value types here\n}\n\nconst ${name}Context = createContext<${name}ContextType | undefined>(undefined);\n\nexport const ${name}Provider = ({ children }: ${name}ContextProps) => {\n  // const [value, setValue] = useState();\n  return (\n    <${name}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${name}Context.Provider>\n  );\n};\n\nexport const use${name} = () => {\n  const context = useContext(${name}Context);\n  if (!context) throw new Error('use${name} must be used within a ${name}Provider');\n  return context;\n};\n`
        : `import React, { createContext, useContext, useState } from 'react';\n\nconst ${name}Context = createContext(undefined);\n\nexport const ${name}Provider = ({ children }) => {\n  // const [value, setValue] = useState();\n  return (\n    <${name}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${name}Context.Provider>\n  );\n};\n\nexport const use${name} = () => {\n  const context = useContext(${name}Context);\n  if (!context) throw new Error('use${name} must be used within a ${name}Provider');\n  return context;\n};\n`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created context: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Context exists: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
} 