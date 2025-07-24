import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile, createFolder } from '../../utils/file';

function findFoldersByName(baseDir: string, folderName: string): string[] {
  const results: string[] = [];
  function search(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name.toLowerCase() === folderName.toLowerCase()) {
          results.push(path.join(dir, entry.name));
        }
        search(path.join(dir, entry.name));
      }
    }
  }
  search(baseDir);
  return results;
}

export function registerGenerateContext(generate: Command, rl: any) {
  generate
    .command('context [name] [folder]')
    .description('Generate a React context (optionally in a specific folder under app/)')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode for context and folder selection')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string | undefined, folder: string | undefined, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      let contextName = name;
      let targetDir: string | undefined = undefined;
      if (options.interactive) {
        // 1. Prompt for context name
        contextName = (await askQuestion(rl, chalk.blue('Enter context name (PascalCase): '))) || '';
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(contextName)) {
          console.log(chalk.red('❌ Context name must be PascalCase and start with a capital letter'));
          rl.close();
          return;
        }
        // 2. Ask if user wants to add to a specific folder
        const useFolder = await askQuestion(rl, chalk.blue('Add to a specific folder under app/? (y/n): '));
        if (useFolder.toLowerCase() === 'y') {
          // 3. Prompt for folder name
          const folderName = await askQuestion(rl, chalk.blue('Enter folder name: '));
          if (!folderName) {
            console.log(chalk.red('❌ Folder name required.'));
            rl.close();
            return;
          }
          if (folderName.includes('/') || folderName.includes('\\')) {
            targetDir = path.join(config.baseDir, folderName);
          } else {
            const baseSearch = path.join(process.cwd(), 'app');
            const matches = findFoldersByName(baseSearch, folderName);
            if (matches.length === 0) {
              const createNew = await askQuestion(rl, chalk.yellow(`No folder named "${folderName}" found under app/. Create it? (y/n): `));
              if (createNew.toLowerCase() !== 'y') {
                console.log(chalk.yellow('⏩ Context creation cancelled'));
                rl.close();
                return;
              }
              targetDir = path.join(baseSearch, folderName);
              fs.mkdirSync(targetDir, { recursive: true });
              console.log(chalk.green(`📁 Created directory: ${targetDir}`));
            } else if (matches.length === 1) {
              targetDir = matches[0];
            } else {
              let chosen = matches[0];
              console.log(chalk.yellow('Multiple folders found:'));
              matches.forEach((m, i) => console.log(`${i + 1}: ${m}`));
              const idx = await askQuestion(rl, chalk.blue('Select folder number: '));
              const num = parseInt(idx, 10);
              if (!isNaN(num) && num >= 1 && num <= matches.length) {
                chosen = matches[num - 1];
              } else {
                console.log(chalk.red('Invalid selection. Context creation cancelled.'));
                rl.close();
                return;
              }
              targetDir = chosen;
            }
          }
        } else {
          targetDir = path.join(config.baseDir, 'contexts');
        }
        await createContextInPath(contextName, targetDir, useTS, options.replace);
        rl.close();
        return;
      }
      // Non-interactive mode (legacy)
      if (!contextName) {
        console.log(chalk.red('❌ Context name is required.'));
        rl.close();
        return;
      }
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(contextName)) {
        console.log(chalk.red('❌ Context name must be PascalCase and start with a capital letter'));
        rl.close();
        return;
      }
      if (folder) {
        if (folder.includes('/') || folder.includes('\\')) {
          targetDir = path.join(config.baseDir, folder);
        } else {
          const baseSearch = path.join(process.cwd(), 'app');
          const matches = findFoldersByName(baseSearch, folder);
          if (matches.length === 0) {
            console.log(chalk.red(`❌ No folder named "${folder}" found under app/. Use -i to create interactively.`));
            rl.close();
            return;
          } else if (matches.length === 1) {
            targetDir = matches[0];
          } else {
            targetDir = matches[0]; // Default to first match
          }
        }
        await createContextInPath(contextName, targetDir, useTS, options.replace);
      } else {
        const filePath = `${config.baseDir}/contexts/${contextName}Context.${useTS ? 'tsx' : 'jsx'}`;
        const content = useTS
          ? `import React, { createContext, useContext, useState, ReactNode } from 'react';\n\ninterface ${contextName}ContextProps {\n  children: ReactNode;\n}\n\ninterface ${contextName}ContextType {\n  // Add your context value types here\n}\n\nconst ${contextName}Context = createContext<${contextName}ContextType | undefined>(undefined);\n\nexport const ${contextName}Provider = ({ children }: ${contextName}ContextProps) => {\n  // const [value, setValue] = useState();\n  return (\n    <${contextName}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${contextName}Context.Provider>\n  );\n};\n\nexport const use${contextName} = () => {\n  const context = useContext(${contextName}Context);\n  if (!context) throw new Error('use${contextName} must be used within a ${contextName}Provider');\n  return context;\n};\n`
          : `import React, { createContext, useContext, useState } from 'react';\n\nconst ${contextName}Context = createContext(undefined);\n\nexport const ${contextName}Provider = ({ children }) => {\n  // const [value, setValue] = useState();\n  return (\n    <${contextName}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${contextName}Context.Provider>\n  );\n};\n\nexport const use${contextName} = () => {\n  const context = useContext(${contextName}Context);\n  if (!context) throw new Error('use${contextName} must be used within a ${contextName}Provider');\n  return context;\n};\n`;
        if (createFile(filePath, content, options.replace)) {
          console.log(chalk.green(`✅ Created context: ${filePath}`));
        } else {
          console.log(chalk.yellow(`⚠️ Context exists: ${filePath} (use --replace to overwrite)`));
        }
      }
      rl.close();
    });
}

async function createContextInPath(contextName: string, fullPath: string, useTS: boolean, replace = false) {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${fullPath}`));
    }
    const filePath = path.join(fullPath, `${contextName}Context.${useTS ? 'tsx' : 'jsx'}`);
    if (fs.existsSync(filePath) && !replace) {
      console.log(chalk.yellow(`⚠️ Context file already exists: ${filePath}`));
      return;
    }
    const content = useTS
      ? `import React, { createContext, useContext, useState, ReactNode } from 'react';\n\ninterface ${contextName}ContextProps {\n  children: ReactNode;\n}\n\ninterface ${contextName}ContextType {\n  // Add your context value types here\n}\n\nconst ${contextName}Context = createContext<${contextName}ContextType | undefined>(undefined);\n\nexport const ${contextName}Provider = ({ children }: ${contextName}ContextProps) => {\n  // const [value, setValue] = useState();\n  return (\n    <${contextName}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${contextName}Context.Provider>\n  );\n};\n\nexport const use${contextName} = () => {\n  const context = useContext(${contextName}Context);\n  if (!context) throw new Error('use${contextName} must be used within a ${contextName}Provider');\n  return context;\n};\n`
      : `import React, { createContext, useContext, useState } from 'react';\n\nconst ${contextName}Context = createContext(undefined);\n\nexport const ${contextName}Provider = ({ children }) => {\n  // const [value, setValue] = useState();\n  return (\n    <${contextName}Context.Provider value={{ /* value */ }}>\n      {children}\n    </${contextName}Context.Provider>\n  );\n};\n\nexport const use${contextName} = () => {\n  const context = useContext(${contextName}Context);\n  if (!context) throw new Error('use${contextName} must be used within a ${contextName}Provider');\n  return context;\n};\n`;
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`✅ Created context: ${filePath}`));
  } catch (error: any) {
    console.log(chalk.red(`❌ Error creating context:`));
    console.error(chalk.red(error.message));
    if (error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
} 