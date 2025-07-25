import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { createFile, createFolder } from '../../utils/file';
import { Interface as ReadlineInterface } from 'readline';

export function registerGenerateRoutes(generate: Command, rl: ReadlineInterface) {
  generate
    .command('routes')    
    .description('Generate a routes configuration file')
    .option('--replace', 'Replace file if it exists')
    .action(async (options) => {
      const config = await setupConfiguration(rl);
      const ext = config.typescript ? 'tsx' : 'jsx';
      const folderPath = path.join(config.baseDir, 'routes');
      createFolder(folderPath);
      const filePath = path.join(folderPath, `routes.${ext}`);
      const content = config.typescript
        ? `import { createBrowserRouter } from 'react-router-dom';\nimport App from '../App';\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <App />,\n    children: [\n      // Add your routes here\n    ],\n  },\n]);\n\nexport default router;\n`
        : `import { createBrowserRouter } from 'react-router-dom';\nimport App from '../App';\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <App />,\n    children: [\n      // Add your routes here\n    ],\n  },\n]);\n\nexport default router;\n`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created routes config: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Routes config exists: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
}
