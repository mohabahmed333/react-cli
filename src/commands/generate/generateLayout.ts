import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { createFile, createFolder } from '../../utils/file';
import { askQuestion } from '../../utils/prompt';
import {
  shouldUseAI,
  generateLayoutWithAI,
  getAIFeatures,
  confirmAIOutput,
  GenerateOptions
} from '../../utils/generateAIHelper';
import fs from 'fs';
import { Interface as ReadlineInterface } from 'readline';

export function registerGenerateLayout(generate: Command, rl: ReadlineInterface) {
  generate
    .command('layout <n>')
    .description('Create a layout component with nested routing support')
    .option('--sidebar', 'Include sidebar')
    .option('--navbar', 'Include navigation bar')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode')
    .option('--ai', 'Use AI to generate the layout code')
    .action(async (name: string, options: GenerateOptions) => {
      try {
        console.log(chalk.cyan('\n🎨 Layout Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        const ext = config.typescript ? 'tsx' : 'jsx';
        const folderPath = path.join(config.baseDir, 'layouts');
        createFolder(folderPath);
        const filePath = path.join(folderPath, `${name}Layout.${ext}`);

        let useAI = false;
        let aiFeatures = '';

        if (options.interactive) {
          // Ask about AI usage if enabled
          if (config.aiEnabled) {
            useAI = await shouldUseAI(rl, options, config);
            if (useAI) {
              console.log(chalk.cyan('\n📝 Layout Configuration'));
              options.sidebar = (await askQuestion(rl, chalk.blue('Include sidebar? (y/n): '))) === 'y';
              options.navbar = (await askQuestion(rl, chalk.blue('Include navbar? (y/n): '))) === 'y';

              console.log(chalk.cyan('\nDescribe additional features (e.g., "responsive design, theme switching, nested routing"):'));
              aiFeatures = await getAIFeatures(rl, 'Layout');
            }
          }
        } else {
          useAI = await shouldUseAI(rl, options, config);
        }

        let content = '';
        if (useAI) {
          const aiContent = await generateLayoutWithAI(name, config, {
            features: aiFeatures,
            sidebar: options.sidebar,
            navbar: options.navbar
          });

          if (aiContent && (!fs.existsSync(filePath) || options.replace)) {
            if (rl && await confirmAIOutput(rl, aiContent)) {
              content = aiContent;
            }
          }
        }

        if (!content) {
          const sidebar = options.sidebar ? `{/* Sidebar content here */}\n` : '';
          const navbar = options.navbar ? `{/* Navbar content here */}\n` : '';
          content = config.typescript
            ? `import { Outlet } from 'react-router-dom';\n\nexport default function ${name}Layout() {\n  return (\n    <div className=\"${name.toLowerCase()}-layout\">\n      ${navbar}\n      <div className=\"layout-content\">\n        ${sidebar}\n        <main>\n          <Outlet />\n        </main>\n      </div>\n    </div>\n  );\n}\n`
            : `import { Outlet } from 'react-router-dom';\n\nexport default function ${name}Layout() {\n  return (\n    <div className=\"${name.toLowerCase()}-layout\">\n      ${navbar}\n      <div className=\"layout-content\">\n        ${sidebar}\n        <main>\n          <Outlet />\n        </main>\n      </div>\n    </div>\n  );\n}\n`;
        }

        if (createFile(filePath, content, options.replace)) {
          console.log(chalk.green(`✅ Created layout: ${filePath}`));
        } else {
          console.log(chalk.yellow(`⚠️ Layout exists: ${filePath} (use --replace to overwrite)`));
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(chalk.red('❌ Error generating layout:'), errorMessage);
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
        } else if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
          console.log(chalk.yellow('💡 You might need permission to write to this directory'));
        }
      } finally {
        rl.close();
      }
    });
}
