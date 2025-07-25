import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { createFile, createFolder } from '../../utils/file';
import { askQuestion } from '../../utils/prompt';
import { 
  shouldUseAI, 
  generateTestUtilsWithAI, 
  getAIFeatures, 
  confirmAIOutput 
} from '../../utils/generateAIHelper';
import fs from 'fs';
import { Interface as ReadlineInterface } from 'readline';
export function registerGenerateTestUtils(generate: Command, rl: ReadlineInterface) {
  generate
    .command('test-utils')
    .description('Create test utilities for React Testing Library')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode')
    .option('--ai', 'Use AI to generate the test utilities code')
    .action(async (options) => {
      try {
        console.log(chalk.cyan('\n🧪 Test Utilities Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        const ext = config.typescript ? 'ts' : 'js';
        const folderPath = path.join(config.baseDir, 'test-utils');
        createFolder(folderPath);
        const filePath = path.join(folderPath, `test-utils.${ext}`);

        let useAI = false;
        let aiFeatures = '';

        if (options.interactive) {
          // Ask about AI usage if enabled
          if (config.aiEnabled) {
            useAI = await shouldUseAI(rl, options, config);
            if (useAI) {
              console.log(chalk.cyan('\n📝 Test Utilities Configuration'));
              console.log(chalk.cyan('\nDescribe additional features (e.g., "mock providers, custom queries, test data generators"):'));
              aiFeatures = await getAIFeatures(rl, 'TestUtils');
            }
          }
        } else {
          useAI = await shouldUseAI(rl, options, config);
        }

        let content = '';
        if (useAI) {
          const aiContent = await generateTestUtilsWithAI(config, {
            features: aiFeatures
          });

          if (aiContent && (!fs.existsSync(filePath) || options.replace)) {
            if (await confirmAIOutput(rl, aiContent)) {
              content = aiContent;
            }
          }
        }

        if (!content) {
          content = `// Test utilities\nimport { render } from '@testing-library/react';\nimport { ThemeProvider } from '../contexts/ThemeContext';\n\nconst AllTheProviders = ({ children }) => {\n  return (\n    <ThemeProvider>\n      {children}\n    </ThemeProvider>\n  );\n};\n\nexport const customRender = (ui, options) =>\n  render(ui, { wrapper: AllTheProviders, ...options });\n\n// Re-export everything\n// export * from '@testing-library/react';\n`;
        }

        if (createFile(filePath, content, options.replace)) {
          console.log(chalk.green(`✅ Created test utilities: ${filePath}`));
        } else {
          console.log(chalk.yellow(`⚠️ Test utilities exist: ${filePath} (use --replace to overwrite)`));
        }
      } catch (error) {
        console.error(chalk.red('❌ Error generating test utilities:'), error);
      } finally {
        rl.close();
      }
    });
}
