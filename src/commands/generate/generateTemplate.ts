import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import readline from 'readline';
import { 
  generateFromTemplate, 
  listTemplates, 
  templateExists 
} from '../../utils/template';
import { askQuestion, askChoice } from '../../utils/prompt';
import { setupConfiguration } from '../../utils/config';
import type { TReadlineInterface } from '../../types/ReadLineInterface';

export function registerGenerateTemplate(generate: Command, rl: TReadlineInterface) {
  generate
    .command('template [templateName] [newName]')
    .description('Generate new feature from saved template')
    .option('-t, --target <path>', 'Target directory path')
    .option('-n, --naming <convention>', 'Naming convention (pascal|camel|kebab|snake|constant|original)', 'pascal')
    .option('--replace', 'Replace existing files if they exist')
    .option('--preserve-case', 'Preserve original case in transformations')
    .option('-i, --interactive', 'Use interactive mode for template selection and generation')
    .action(async (templateName: string | undefined, newName: string | undefined, options: any) => {
      try {
        const config = await setupConfiguration(rl);
        
        // Set default target directory from config if not provided
        if (!options.target) {
          options.target = path.join(config.baseDir, 'features');
        }

        // Interactive template selection if not provided
        let finalTemplateName = templateName;
        if (!finalTemplateName || options.interactive) {
          const templates = listTemplates();
          
          if (templates.length === 0) {
            console.log(chalk.yellow('No templates found.'));
            console.log(chalk.cyan('Create your first template with:'));
            console.log(chalk.white('  npx react-cli template save <sourcePath> <templateName>'));
            rl.close();
            return;
          }

          if (!finalTemplateName) {
            console.log(chalk.cyan.bold('\n📦 Available Templates'));
            console.log(chalk.gray('Choose from your saved templates:\n'));
            
            // Display templates with detailed information
            templates.forEach((template, index) => {
              console.log(chalk.cyan(`  ${index + 1}. ${chalk.bold(template.name)}`));
              console.log(chalk.gray(`     Description: ${template.metadata.description || 'No description'}`));
              console.log(chalk.gray(`     Files: ${template.metadata.files?.length || 0} files`));
              console.log(chalk.gray(`     Created: ${new Date(template.metadata.createdAt).toLocaleDateString()}`));
              if (template.metadata.tags && template.metadata.tags.length > 0) {
                console.log(chalk.gray(`     Tags: ${template.metadata.tags.join(', ')}`));
              }
              console.log('');
            });
            
            const templateChoices = templates.map(template => ({
              value: template.name,
              label: `${template.name} - ${template.metadata.description || 'No description'}`
            }));

            finalTemplateName = await askChoice(
              rl,
              'Select a template to use:',
              templateChoices
            );
          }
        }

        if (!finalTemplateName) {
          console.error(chalk.red('No template specified.'));
          rl.close();
          return;
        }

        // Verify template exists
        if (!templateExists(finalTemplateName)) {
          console.error(chalk.red(`Template "${finalTemplateName}" not found.`));
          console.log(chalk.yellow('Available templates:'));
          const templates = listTemplates();
          templates.forEach(t => console.log(chalk.cyan(`  - ${t.name}`)));
          rl.close();
          return;
        }

        // Interactive new name input if not provided
        let finalNewName = newName;
        if (!finalNewName || options.interactive) {
          if (!finalNewName) {
            finalNewName = await askQuestion(rl, `Enter the new feature name: `);
          }
          
          if (!finalNewName || finalNewName.trim().length === 0) {
            console.error(chalk.red('Feature name is required.'));
            rl.close();
            return;
          }
        }

        let finalOptions = {
          templateName: finalTemplateName,
          newName: finalNewName!,
          targetPath: path.join(options.target, finalNewName!),
          namingConvention: options.naming as any,
          replace: options.replace,
          preserveCase: options.preserveCase
        };

        // Interactive mode for additional options
        if (options.interactive) {
          console.log(chalk.cyan.bold('\n🎯 Template Generation Settings'));
          console.log(chalk.gray(`Generating "${finalNewName}" from template "${finalTemplateName}"...\n`));

          // Target directory with config-aware suggestions
          console.log(chalk.gray(`Current config base directory: ${config.baseDir}`));
          console.log(chalk.gray(`Suggested target: ${finalOptions.targetPath}\n`));
          
          const targetDir = await askQuestion(
            rl, 
            `Enter target directory [${finalOptions.targetPath}]: `
          );
          
          if (targetDir && targetDir.trim()) {
            // If user provided a relative path, resolve it relative to config.baseDir
            if (!path.isAbsolute(targetDir)) {
              finalOptions.targetPath = path.resolve(config.baseDir, targetDir, finalNewName!);
            } else {
              finalOptions.targetPath = path.resolve(targetDir, finalNewName!);
            }
          } else {
            finalOptions.targetPath = path.resolve(finalOptions.targetPath);
          }

          // Naming convention
          const conventions = [
            { value: 'pascal', label: 'PascalCase (MyFeature)' },
            { value: 'camel', label: 'camelCase (myFeature)' },
            { value: 'kebab', label: 'kebab-case (my-feature)' },
            { value: 'snake', label: 'snake_case (my_feature)' },
            { value: 'constant', label: 'CONSTANT_CASE (MY_FEATURE)' },
            { value: 'original', label: 'Keep original casing' }
          ];

          finalOptions.namingConvention = await askChoice(
            rl,
            'Choose naming convention:',
            conventions
          ) as any;

          // Replace confirmation
          if (!options.replace) {
            const shouldReplace = await askChoice(
              rl,
              'Replace existing files if they exist?',
              [
                { value: 'false', label: 'No, skip existing files' },
                { value: 'true', label: 'Yes, replace existing files' }
              ]
            );
            finalOptions.replace = shouldReplace === 'true';
          }
        }

        // Show generation summary
        console.log(chalk.blue.bold('\n🎯 Generation Summary'));
        console.log(chalk.cyan(`Template: ${finalOptions.templateName}`));
        console.log(chalk.cyan(`New Name: ${finalOptions.newName}`));
        console.log(chalk.cyan(`Target: ${finalOptions.targetPath}`));
        console.log(chalk.cyan(`Naming: ${finalOptions.namingConvention}`));
        console.log(chalk.cyan(`Replace: ${finalOptions.replace ? 'Yes' : 'No'}\n`));

        // Generate from template
        const success = generateFromTemplate(finalOptions);
        
        if (success) {
          console.log(chalk.green.bold('\n✨ Generation completed successfully!'));
          console.log(chalk.cyan('Next steps:'));
          console.log(chalk.white(`  1. Review generated files in: ${finalOptions.targetPath}`));
          console.log(chalk.white(`  2. Update imports and dependencies if needed`));
          console.log(chalk.white(`  3. Test the generated feature`));
          
          // Show generated file count
          const templates = listTemplates();
          const template = templates.find(t => t.name === finalOptions.templateName);
          if (template?.metadata.files) {
            console.log(chalk.gray(`\n📄 Generated ${template.metadata.files.length} files from template`));
          }
        }

      } catch (error) {
        console.error(chalk.red('Error generating from template:'), error);
      } finally {
        rl.close();
      }
    });
} 