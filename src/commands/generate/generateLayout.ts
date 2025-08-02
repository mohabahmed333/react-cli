import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config/config';
import { askQuestion } from '../../utils/ai/prompt';
import { handleInteractiveName } from '../../utils/shared/handleInteractiveName';
import { createGeneratedFile } from '../../utils/createGeneratedFile/createGeneratedFile';
import { GenerateOptions } from '../../utils/ai/generateAIHelper';
import { Interface as ReadlineInterface } from 'readline';

interface LayoutOptions extends GenerateOptions {
  sidebar?: boolean;
  navbar?: boolean;
  replace?: boolean;
  interactive?: boolean;
  ai?: boolean;
}

export function registerGenerateLayout(generate: Command, rl: ReadlineInterface) {
  generate
    .command('layout [name]')
    .description('Create a layout component with nested routing support')
    .option('--sidebar', 'Include sidebar')
    .option('--navbar', 'Include navigation bar')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode')
    .option('--ai', 'Use AI to generate the layout code')
    .action(async (name: string | undefined, options: LayoutOptions) => {
      try {
        console.log(chalk.cyan('\n🎨 Layout Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        const useTS = config.typescript;

        // Handle layout name
        const layoutName = await handleInteractiveName(
          rl,
          name,
          'layout',
          {
            pattern: /^[A-Z][a-zA-Z0-9]*$/,
            patternError: "❌ Layout name must be PascalCase and start with a capital letter"
          },
        );

        const targetDir = path.join(config.baseDir, 'layouts');
        const fileName = `${layoutName}Layout`;

        // Handle interactive options
        if (options.interactive) {
          options.sidebar = (await askQuestion(
            rl,
            chalk.blue('Include sidebar? (y/n): ')
          )) === 'y';

          options.navbar = (await askQuestion(
            rl,
            chalk.blue('Include navbar? (y/n): ')
          )) === 'y';

          if (config.aiEnabled) {
            options.ai = (await askQuestion(
              rl,
              chalk.blue('Use AI to generate code? (y/n): ')
            )) === 'y';

            if (options.ai) {
              options.aiFeatures = await askQuestion(
                rl,
                chalk.blue('Describe additional features (e.g., "responsive design, theme switching"): ')
              );
            }
          }
        }

        const defaultContent = generateLayoutContent(layoutName, options, useTS);

        await createGeneratedFile({
          rl,
          config,
          type: 'layout',
          name: fileName,
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent,
          aiOptions: options.ai ? {
            features: options.aiFeatures,
            additionalPrompt: generateAIPrompt(layoutName, options)
          } : undefined
        });

        console.log(chalk.green(`✅ Successfully generated ${layoutName} layout`));
      } catch (error) {
        console.error(chalk.red('❌ Error generating layout:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}

function generateLayoutContent(name: string, options: LayoutOptions, useTS: boolean): string {
  const sidebar = options.sidebar ? `{/* Sidebar content here */}\n` : '';
  const navbar = options.navbar ? `{/* Navbar content here */}\n` : '';

  return useTS
    ? `import { Outlet } from 'react-router-dom';\n\nexport default function ${name}Layout() {\n  return (\n    <div className="${name.toLowerCase()}-layout">\n      ${navbar}\n      <div className="layout-content">\n        ${sidebar}\n        <main>\n          <Outlet />\n        </main>\n      </div>\n    </div>\n  );\n}\n`
    : `import { Outlet } from 'react-router-dom';\n\nexport default function ${name}Layout() {\n  return (\n    <div className="${name.toLowerCase()}-layout">\n      ${navbar}\n      <div className="layout-content">\n        ${sidebar}\n        <main>\n          <Outlet />\n        </main>\n      </div>\n    </div>\n  );\n}\n`;
}

function generateAIPrompt(name: string, options: LayoutOptions): string {
  const features = [
    options.sidebar && 'sidebar',
    options.navbar && 'navbar',
    options.aiFeatures
  ].filter(Boolean).join(', ');

  return `Create a ${name}Layout component in React with: ${features}. Include nested routing support with Outlet.`;
}