import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../utils/config';
import { createFile, createFolder } from '../utils/file';

export function registerGenerateTestUtils(generate: Command, rl: any) {
  generate
    .command('test-utils')
    .description('Create test utilities for React Testing Library')
    .option('--replace', 'Replace file if it exists')
    .action(async (options: any) => {
      const config = await setupConfiguration(rl);
      const ext = config.typescript ? 'ts' : 'js';
      const folderPath = path.join(config.baseDir, 'test-utils');
      createFolder(folderPath);
      const filePath = path.join(folderPath, `test-utils.${ext}`);
      const content = `// Test utilities\nimport { render } from '@testing-library/react';\nimport { ThemeProvider } from '../contexts/ThemeContext';\n\nconst AllTheProviders = ({ children }) => {\n  return (\n    <ThemeProvider>\n      {children}\n    </ThemeProvider>\n  );\n};\n\nexport const customRender = (ui, options) =>\n  render(ui, { wrapper: AllTheProviders, ...options });\n\n// Re-export everything\n// export * from '@testing-library/react';\n`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created test utilities: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Test utilities exist: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
}
