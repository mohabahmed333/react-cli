import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { setupConfiguration } from '../utils/config';
import { askQuestion } from '../utils/prompt';
import { createFile } from '../utils/file';

export function handleGlobal(program: Command, rl: readline.Interface) {
  program
    .command('global')
    .description('Create multiple global resources')
    .option('-i, --interactive', 'Use interactive mode')
    .action(async (options) => {
      const config = await setupConfiguration(rl);
      if (options.interactive) {
        console.log(chalk.cyan.bold('\n✨ Creating global resources interactively ✨'));
        while (true) {
          const resourceType = await askQuestion(rl, chalk.blue('Create (h)ook, (u)til, (t)ype, or (q)uit? '));
          if (resourceType === 'q') break;
          switch (resourceType) {
            case 'h': {
              const hookName = await askQuestion(rl, chalk.blue('Hook name: '));
              const ext = config.typescript ? 'ts' : 'js';
              const content = config.typescript
                ? `import { useState } from 'react';\n\nexport const use${hookName} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
                : `import { useState } from 'react';\n\nexport const use${hookName} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
              createFile(`${config.baseDir}/hooks/use${hookName}.${ext}`, content);
              break;
            }
            case 'u': {
              const utilName = await askQuestion(rl, chalk.blue('Utility name: '));
              const ext = config.typescript ? 'ts' : 'js';
              const content = config.typescript
                ? `export const ${utilName} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
                : `export const ${utilName} = (input) => {\n  return input.toUpperCase();\n};\n`;
              createFile(`${config.baseDir}/utils/${utilName}.${ext}`, content);
              break;
            }
            case 't': {
              if (config.typescript) {
                const typeName = await askQuestion(rl, chalk.blue('Type name: '));
                const content = `export interface ${typeName} {\n  // Add properties here\n}\n\nexport type ${typeName}Type = {\n  id: string;\n  name: string;\n};\n`;
                createFile(`${config.baseDir}/types/${typeName}.types.ts`, content);
              } else {
                console.log(chalk.red('TypeScript must be enabled for types'));
              }
              break;
            }
            default:
              console.log(chalk.red('Invalid option'));
          }
        }
      } else {
        console.log(chalk.red('Specify resource type or use --interactive'));
      }
      rl.close();
    });
}
