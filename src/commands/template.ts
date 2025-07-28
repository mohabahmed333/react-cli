import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import path from 'path';
import { 
  saveTemplate, 
  listTemplates, 
  generateFromTemplate,
  templateExists 
} from '../utils/template';
import { askQuestion } from '../utils/prompt';
import { setupConfiguration } from '../utils/config';

export function registerTemplateCommands(program: Command, rl: readline.Interface) {
  const template = program
    .command('template')
    .description('Template management - save, list, and generate from templates');

  // Save template command
  template
    .command('save <sourcePath> <templateName>')
    .description('Save existing feature/component as a reusable template')
    .option('--name <originalName>', 'Original feature name for name transformations')
    .option('--description <desc>', 'Template description')
    .option('--author <author>', 'Template author')
    .option('--tags <tags>', 'Comma-separated tags for the template')
    .option('--replace', 'Replace template if it already exists')
    .option('-i, --interactive', 'Use interactive mode for template creation')
    .action(async (sourcePath: string, templateName: string, options: any) => {
      try {
        const config = await setupConfiguration(rl);
        
        let finalOptions = {
          sourcePath: path.resolve(sourcePath),
          templateName,
          originalName: options.name,
          description: options.description,
          author: options.author,
          tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : undefined
        };

        // Interactive mode
        if (options.interactive) {
          console.log(chalk.cyan.bold('\n📦 Template Creation Wizard'));
          console.log(chalk.gray('Creating a template from existing code...\n'));

          if (!finalOptions.originalName) {
            const defaultName = path.basename(finalOptions.sourcePath);
            const answer = await askQuestion(
              rl, 
              `Enter the original feature name (for name transformations) [${defaultName}]: `
            );
            finalOptions.originalName = answer || defaultName;
          }

          if (!finalOptions.description) {
            const defaultDesc = `Template created from ${finalOptions.originalName}`;
            const answer = await askQuestion(
              rl, 
              `Enter template description [${defaultDesc}]: `
            );
            finalOptions.description = answer || defaultDesc;
          }

          if (!finalOptions.author) {
            const answer = await askQuestion(rl, `Enter author name [Unknown]: `);
            finalOptions.author = answer || 'Unknown';
          }

          if (!finalOptions.tags) {
            const tagsInput = await askQuestion(rl, `Enter tags (comma-separated) []: `);
            finalOptions.tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
          }
        }

        // Check if template exists and handle replacement
        if (templateExists(templateName) && !options.replace) {
          console.log(chalk.yellow(`Template "${templateName}" already exists.`));
          const shouldReplace = await askQuestion(rl, 'Do you want to replace it? (y/n) [n]: ');
          if ((shouldReplace || 'n').toLowerCase() !== 'y') {
            console.log(chalk.blue('Template creation cancelled.'));
            rl.close();
            return;
          }
        }

        const success = saveTemplate(finalOptions);
        
        if (success) {
          console.log(chalk.green.bold('\n🎉 Template saved successfully!'));
          console.log(chalk.cyan('You can now use it with:'));
          console.log(chalk.white(`  npx react-cli template from ${templateName} <newName>`));
          console.log(chalk.white(`  npx react-cli g template ${templateName} <newName>`));
        }

      } catch (error) {
        console.error(chalk.red('Error creating template:'), error);
      } finally {
        rl.close();
      }
    });

  // List templates command
  template
    .command('list')
    .alias('ls')
    .description('List all available templates')
    .option('--detailed', 'Show detailed template information')
    .action(async (options: any) => {
      try {
        const templates = listTemplates();

        if (templates.length === 0) {
          console.log(chalk.yellow('No templates found.'));
          console.log(chalk.cyan('Create your first template with:'));
          console.log(chalk.white('  npx react-cli template save <sourcePath> <templateName>'));
          rl.close();
          return;
        }

        console.log(chalk.cyan.bold(`\n📦 Available Templates (${templates.length})\n`));

        for (const template of templates) {
          const { name, metadata } = template;
          
          console.log(chalk.green.bold(`📄 ${name}`));
          
          if (options.detailed) {
            console.log(chalk.gray(`   Original Name: ${metadata.originalName}`));
            console.log(chalk.gray(`   Description: ${metadata.description || 'No description'}`));
            console.log(chalk.gray(`   Author: ${metadata.author || 'Unknown'}`));
            console.log(chalk.gray(`   Created: ${new Date(metadata.createdAt).toLocaleDateString()}`));
            console.log(chalk.gray(`   Version: ${metadata.version}`));
            
            if (metadata.tags && metadata.tags.length > 0) {
              console.log(chalk.gray(`   Tags: ${metadata.tags.join(', ')}`));
            }
            
            if (metadata.files && metadata.files.length > 0) {
              console.log(chalk.gray(`   Files: ${metadata.files.length} files`));
            }
            console.log('');
          } else {
            console.log(chalk.gray(`   ${metadata.description || 'No description'}`));
          }
        }

        console.log(chalk.cyan('\nUsage:'));
        console.log(chalk.white('  npx react-cli template from <templateName> <newName>'));
        console.log(chalk.white('  npx react-cli g template <templateName> <newName>'));

      } catch (error) {
        console.error(chalk.red('Error listing templates:'), error);
      } finally {
        rl.close();
      }
    });

  // Generate from template command
  template
    .command('from <templateName> <newName>')
    .description('Generate new feature from template')
    .option('--target <path>', 'Target directory path', 'src/features')
    .option('--naming <convention>', 'Naming convention (pascal|camel|kebab|snake|constant|original)', 'pascal')
    .option('--replace', 'Replace existing files')
    .option('--preserve-case', 'Preserve original case in transformations')
    .option('-i, --interactive', 'Use interactive mode for generation')
    .action(async (templateName: string, newName: string, options: any) => {
      try {
        const config = await setupConfiguration(rl);
        
        let finalOptions = {
          templateName,
          newName,
          targetPath: path.join(options.target, newName),
          namingConvention: options.naming as any,
          replace: options.replace,
          preserveCase: options.preserveCase
        };

        // Interactive mode
        if (options.interactive) {
          console.log(chalk.cyan.bold('\n🎯 Template Generation Wizard'));
          console.log(chalk.gray(`Generating "${newName}" from template "${templateName}"...\n`));

          const targetDir = await askQuestion(
            rl, 
            `Enter target directory [${finalOptions.targetPath}]: `
          );
          finalOptions.targetPath = path.resolve(targetDir || finalOptions.targetPath);

          const conventions = ['pascal', 'camel', 'kebab', 'snake', 'constant', 'original'];
          console.log(chalk.cyan('Available naming conventions:'));
          conventions.forEach((conv, index) => {
            console.log(chalk.gray(`  ${index + 1}. ${conv}`));
          });

          const conventionChoice = await askQuestion(
            rl, 
            `Choose naming convention (1-${conventions.length}) [1]: `
          );
          
          const conventionIndex = parseInt(conventionChoice || '1') - 1;
          if (conventionIndex >= 0 && conventionIndex < conventions.length) {
            finalOptions.namingConvention = conventions[conventionIndex] as any;
          }
        }

        const success = generateFromTemplate(finalOptions);
        
        if (success) {
          console.log(chalk.green.bold('\n✨ Generation completed successfully!'));
          console.log(chalk.cyan('Next steps:'));
          console.log(chalk.white(`  1. Review generated files in: ${finalOptions.targetPath}`));
          console.log(chalk.white(`  2. Update imports and dependencies if needed`));
          console.log(chalk.white(`  3. Test the generated feature`));
        }

      } catch (error) {
        console.error(chalk.red('Error generating from template:'), error);
      } finally {
        rl.close();
      }
    });

  // Delete template command
  template
    .command('delete <templateName>')
    .alias('rm')
    .description('Delete a template')
    .option('--force', 'Force deletion without confirmation')
    .action(async (templateName: string, options: any) => {
      try {
        if (!templateExists(templateName)) {
          console.error(chalk.red(`Template "${templateName}" not found.`));
          rl.close();
          return;
        }

        if (!options.force) {
          const confirm = await askQuestion(
            rl, 
            `Are you sure you want to delete template "${templateName}"? (y/n) [n]: `
          );
          
          if ((confirm || 'n').toLowerCase() !== 'y') {
            console.log(chalk.blue('Deletion cancelled.'));
            rl.close();
            return;
          }
        }

        const fs = require('fs');
        const { getTemplatePath } = require('../utils/template');
        const templatePath = getTemplatePath(templateName);
        
        fs.rmSync(templatePath, { recursive: true, force: true });
        console.log(chalk.green(`✅ Template "${templateName}" deleted successfully.`));

      } catch (error) {
        console.error(chalk.red('Error deleting template:'), error);
      } finally {
        rl.close();
      }
    });

  // Template info command
  template
    .command('info <templateName>')
    .description('Show detailed information about a template')
    .action(async (templateName: string) => {
      try {
        if (!templateExists(templateName)) {
          console.error(chalk.red(`Template "${templateName}" not found.`));
          rl.close();
          return;
        }

        const { getTemplateMetadata } = require('../utils/template');
        const metadata = getTemplateMetadata(templateName);

        if (!metadata) {
          console.error(chalk.red(`Could not read template metadata for "${templateName}".`));
          rl.close();
          return;
        }

        console.log(chalk.cyan.bold(`\n📦 Template: ${templateName}\n`));
        console.log(chalk.green(`Name: ${metadata.templateName}`));
        console.log(chalk.green(`Original Name: ${metadata.originalName}`));
        console.log(chalk.green(`Description: ${metadata.description || 'No description'}`));
        console.log(chalk.green(`Author: ${metadata.author || 'Unknown'}`));
        console.log(chalk.green(`Version: ${metadata.version}`));
        console.log(chalk.green(`Created: ${new Date(metadata.createdAt).toLocaleDateString()}`));

        if (metadata.tags && metadata.tags.length > 0) {
          console.log(chalk.green(`Tags: ${metadata.tags.join(', ')}`));
        }

        if (metadata.files && metadata.files.length > 0) {
          console.log(chalk.green(`Files: ${metadata.files.length} files`));
          console.log(chalk.gray('\nFile list:'));
          metadata.files.slice(0, 10).forEach((file: string) => {
            console.log(chalk.gray(`  - ${file}`));
          });
          if (metadata.files.length > 10) {
            console.log(chalk.gray(`  ... and ${metadata.files.length - 10} more files`));
          }
        }

        console.log(chalk.cyan('\nUsage:'));
        console.log(chalk.white(`  npx react-cli template from ${templateName} <newName>`));

      } catch (error) {
        console.error(chalk.red('Error getting template info:'), error);
      } finally {
        rl.close();
      }
    });

  // Validate template transformations command
  template
    .command('validate <generatedPath> <originalName> <newName>')
    .description('Validate that all old naming has been properly transformed in generated feature')
    .option('--fix', 'Attempt to fix found issues automatically')
    .option('--detailed', 'Show detailed analysis of each file')
    .action(async (generatedPath: string, originalName: string, newName: string, options: any) => {
      try {
        const { validateTransformations } = require('../utils/template-validator');
        
        console.log(chalk.cyan.bold('\n🔍 Template Transformation Validation'));
        console.log(chalk.gray(`Checking: ${generatedPath}`));
        console.log(chalk.gray(`Original: ${originalName} → New: ${newName}\n`));

        const validationResult = await validateTransformations(
          path.resolve(generatedPath),
          originalName,
          newName,
          {
            detailed: options.detailed,
            fix: options.fix
          }
        );

        if (validationResult.success) {
          console.log(chalk.green.bold('✅ All transformations completed successfully!'));
          console.log(chalk.cyan(`📄 Scanned ${validationResult.filesScanned} files`));
        } else {
          console.log(chalk.red.bold('❌ Found naming issues:'));
          console.log(chalk.yellow(`📄 Issues found in ${validationResult.issuesFound} locations`));
          
          if (options.detailed) {
            validationResult.issues.forEach((issue: any) => {
              console.log(chalk.red(`\n📁 ${issue.file}:`));
              issue.patterns.forEach((pattern: any) => {
                console.log(chalk.yellow(`   Line ${pattern.line}: ${pattern.oldPattern} → should be ${pattern.suggested}`));
                console.log(chalk.gray(`   Context: ${pattern.context}`));
              });
            });
          }

          if (options.fix) {
            console.log(chalk.blue('\n🔧 Fixes have been applied automatically!'));
            console.log(chalk.cyan('Re-run the validate command to see remaining issues (if any).'));
          } else {
            console.log(chalk.cyan('\nTo fix automatically, run:'));
            console.log(chalk.white(`  npx react-cli template validate "${generatedPath}" ${originalName} ${newName} --fix`));
          }
        }

      } catch (error) {
        console.error(chalk.red('Error validating transformations:'), error);
      } finally {
        rl.close();
      }
    });
} 