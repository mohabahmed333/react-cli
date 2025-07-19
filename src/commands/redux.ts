import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { setupConfiguration } from '../utils/config';
import { createFile, createFolder } from '../utils/file';

export function handleRedux(program: Command, rl: readline.Interface) {
  program
    .command('redux <name>')
    .description('Create a Redux slice (requires @reduxjs/toolkit)')
    .option('--ts', 'Override TypeScript setting')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      const ext = useTS ? 'ts' : 'js';
      const folderPath = `${config.baseDir}/store`;
      createFolder(folderPath);
      const content = useTS
        ? `import { createSlice, PayloadAction } from '@reduxjs/toolkit';\n\ninterface ${name}State {\n  // Add your state properties here\n}\n\nconst initialState: ${name}State = {\n  // ...\n};\n\nconst ${name}Slice = createSlice({\n  name: '${name}',\n  initialState,\n  reducers: {\n    // add reducers here\n  },\n});\n\nexport const { actions, reducer } = ${name}Slice;\n`
        : `import { createSlice } from '@reduxjs/toolkit';\n\nconst initialState = {\n  // ...\n};\n\nconst ${name}Slice = createSlice({\n  name: '${name}',\n  initialState,\n  reducers: {\n    // add reducers here\n  },\n});\n\nexport const { actions, reducer } = ${name}Slice;\n`;
      const filePath = `${folderPath}/${name}Slice.${ext}`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created Redux slice: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Redux slice exists: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
}
