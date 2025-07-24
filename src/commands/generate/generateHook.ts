import { Command } from 'commander';
import chalk from 'chalk';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile } from '../../utils/file';

export function registerGenerateHook(generate: Command, rl: any) {
  generate
    .command('hook <name>')
    .description('Generate a custom React hook')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      const hookName = options.interactive
        ? (await askQuestion(rl, chalk.blue('Enter hook name: '))) || name
        : name;
      const ext = useTS ? 'ts' : 'js';
      const content = useTS
        ? `import { useState } from 'react';\n\nexport const use${hookName} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
        : `import { useState } from 'react';\n\nexport const use${hookName} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
      const filePath = `${config.baseDir}/hooks/use${hookName}.${ext}`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created hook: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Hook exists: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
} 