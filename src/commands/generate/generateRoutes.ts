import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { createGeneratedFile } from '../../utils/file/createGeneratedFile';
import { Interface as ReadlineInterface } from 'readline';

export function registerGenerateRoutes(generate: Command, rl: ReadlineInterface) {
  generate
    .command('routes')    
    .description('Generate a routes configuration file')
    .option('--replace', 'Replace file if it exists')
    .action(async (options) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = config.typescript;
        const targetDir = path.join(config.baseDir, 'routes');
        
        const defaultContent = useTS
          ? `import { createBrowserRouter } from 'react-router-dom';\nimport App from '../App';\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <App />,\n    children: [\n      // Add your routes here\n    ],\n  },\n]);\n\nexport default router;\n`
          : `import { createBrowserRouter } from 'react-router-dom';\nimport App from '../App';\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <App />,\n    children: [\n      // Add your routes here\n    ],\n  },\n]);\n\nexport default router;\n`;

        await createGeneratedFile({
          rl,
          config,
          type: 'component',
          name: 'routes',
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent
        });

        console.log(chalk.green(`✅ Successfully generated routes configuration`));
      } catch (error) {
        console.error(chalk.red('❌ Error generating routes:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}
