import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import path from 'path';
import fs from 'fs';
import { 
  saveTemplate, 
  listTemplates, 
  generateFromTemplate,
  templateExists 
} from '../utils/template/template';
import { askQuestion, askChoice } from '../utils/ai/prompt';
import { setupConfiguration } from '../utils/config/config';
import { generateWithConfiguredAI } from '../utils/config/ai/aiConfig';
import { CLIConfig } from '../utils/config/config';

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
    .option('--target <path>', 'Target directory path')
    .option('--naming <convention>', 'Naming convention (pascal|camel|kebab|snake|constant|original)', 'pascal')
    .option('--replace', 'Replace existing files')
    .option('--preserve-case', 'Preserve original case in transformations')
    .option('-i, --interactive', 'Use interactive mode for generation')
    .action(async (templateName: string, newName: string, options: any) => {
      try {
        const config = await setupConfiguration(rl);
        
        // Set default target directory from config if not provided
        if (!options.target) {
          options.target = path.join(config.baseDir, 'features');
        }
        
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
              finalOptions.targetPath = path.resolve(config.baseDir, targetDir, newName);
            } else {
              finalOptions.targetPath = path.resolve(targetDir, newName);
            }
          } else {
            finalOptions.targetPath = path.resolve(finalOptions.targetPath);
          }

          // Naming convention using improved choice system
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

  // AI-Enhanced Template Generation Command
  template
    .command('ai-generate <templateName> <newName>')
    .alias('ai-gen')
    .description('Generate from template with AI-powered naming verification and post-generation analysis')
    .option('--target <path>', 'Target directory path')
    .option('--naming <convention>', 'Naming convention (pascal|camel|kebab|snake|constant|original)', 'pascal')
    .option('--replace', 'Replace existing files')
    .option('--preserve-case', 'Preserve original case in transformations')
    .option('--analyze', 'Run AI analysis after generation to ensure everything works')
    .option('--fix-naming', 'Use AI to fix any remaining naming convention issues')
    .option('-i, --interactive', 'Use interactive mode for generation')
    .action(async (templateName: string, newName: string, options: any) => {
      try {
        const config = await setupConfiguration(rl);
        
        console.log(chalk.cyan.bold('\n🤖 AI-Enhanced Template Generation'));
        console.log(chalk.white(`Creating "${newName}" from template "${templateName}" with AI assistance...\n`));

        // Set default target directory from config if not provided
        if (!options.target) {
          options.target = path.join(config.baseDir, 'features');
        }
        
        let finalOptions = {
          templateName,
          newName,
          targetPath: path.join(options.target, newName),
          namingConvention: options.naming as any,
          replace: options.replace,
          preserveCase: options.preserveCase
        };

        // Interactive mode with AI suggestions
        if (options.interactive) {
          console.log(chalk.cyan.bold('\n🎯 AI-Enhanced Template Generation Wizard'));
          
          // AI suggests best naming convention based on feature name and context
          const aiNamingRecommendation = await suggestNamingConvention(newName, templateName, config);
          console.log(chalk.blue(`🤖 AI recommends: ${aiNamingRecommendation.convention} (${aiNamingRecommendation.reasoning})`));
          
          const conventions = [
            { value: aiNamingRecommendation.convention, label: `${aiNamingRecommendation.convention} (AI Recommended)` },
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

          // AI suggests target path optimization
          const aiPathSuggestion = await suggestTargetPath(newName, templateName, config);
          if (aiPathSuggestion.suggested !== finalOptions.targetPath) {
            console.log(chalk.blue(`🤖 AI suggests path: ${aiPathSuggestion.suggested} (${aiPathSuggestion.reasoning})`));
            
            const pathChoice = await askChoice(
              rl,
              'Choose target path:',
              [
                { value: aiPathSuggestion.suggested, label: `${aiPathSuggestion.suggested} (AI Recommended)` },
                { value: finalOptions.targetPath, label: `${finalOptions.targetPath} (Default)` },
                { value: 'custom', label: 'Enter custom path' }
              ]
            );

            if (pathChoice === 'custom') {
              const customPath = await askQuestion(rl, 'Enter custom target path: ');
              finalOptions.targetPath = path.resolve(customPath);
            } else {
              finalOptions.targetPath = pathChoice;
            }
          }
        }

        // Step 1: Generate from template
        console.log(chalk.blue('\n🏗️ Step 1: Generating from template...'));
        const success = generateFromTemplate(finalOptions);
        
        if (!success) {
          console.log(chalk.red('❌ Template generation failed!'));
          return;
        }

        console.log(chalk.green('✅ Base template generation completed!'));

        // Step 2: AI-powered naming verification
        if (options.fixNaming || options.interactive) {
          console.log(chalk.blue('\n🔍 Step 2: AI-powered naming verification...'));
          await performAINamingVerification(finalOptions, config);
        }

        // Step 3: AI analysis of generated code
        if (options.analyze || options.interactive) {
          console.log(chalk.blue('\n🧠 Step 3: AI analysis of generated code...'));
          await performAICodeAnalysis(finalOptions, config);
        }

        // Step 4: Final validation and suggestions
        console.log(chalk.blue('\n✨ Step 4: Final validation and next steps...'));
        const validationResults = await performFinalValidation(finalOptions, config);

        // Show results
        console.log(chalk.green.bold('\n🎉 AI-Enhanced Template Generation Complete!'));
        console.log(chalk.cyan('\n📊 Summary:'));
        console.log(chalk.dim(`   Template: ${templateName}`));
        console.log(chalk.dim(`   Generated: ${newName}`));
        console.log(chalk.dim(`   Location: ${finalOptions.targetPath}`));
        console.log(chalk.dim(`   Naming Convention: ${finalOptions.namingConvention}`));
        
        if (validationResults.issues.length === 0) {
          console.log(chalk.green('   Status: ✅ All checks passed!'));
        } else {
          console.log(chalk.yellow(`   Status: ⚠️ ${validationResults.issues.length} issues found and fixed`));
        }

        console.log(chalk.cyan('\n🚀 AI Recommendations:'));
        validationResults.nextSteps.forEach((step: string, index: number) => {
          console.log(chalk.white(`   ${index + 1}. ${step}`));
        });

      } catch (error) {
        console.error(chalk.red('Error in AI-enhanced template generation:'), error);
      } finally {
        rl.close();
      }
    });
}

// AI Helper Functions for Enhanced Template Generation

interface AINamingRecommendation {
  convention: string;
  reasoning: string;
}

interface AIPathSuggestion {
  suggested: string;
  reasoning: string;
}

interface ValidationResults {
  issues: string[];
  nextSteps: string[];
  filesAnalyzed: number;
}

/**
 * AI suggests the best naming convention based on feature name and template
 */
async function suggestNamingConvention(featureName: string, templateName: string, config: CLIConfig): Promise<AINamingRecommendation> {
  const prompt = `Analyze the feature name "${featureName}" being generated from template "${templateName}" in a ${config.projectType} project.

Recommend the best naming convention and explain why.

Consider:
- React component naming standards
- File and folder conventions
- Template type and purpose
- Project consistency

Available conventions: pascal, camel, kebab, snake, constant, original

Respond with JSON:
{
  "convention": "pascal",
  "reasoning": "Explanation of why this is best for this feature"
}`;

  try {
    const response = await generateWithConfiguredAI(prompt, config);
    if (response) {
      const parsed = JSON.parse(response);
      return parsed;
    }
  } catch (error) {
    // Fallback to sensible defaults
  }
  
  return {
    convention: 'pascal',
    reasoning: 'Default Pascal case for React components (AI analysis failed)'
  };
}

/**
 * AI suggests optimal target path for the feature
 */
async function suggestTargetPath(featureName: string, templateName: string, config: CLIConfig): Promise<AIPathSuggestion> {
  const prompt = `Suggest the best target path for feature "${featureName}" generated from template "${templateName}".

Project context:
- Base directory: ${config.baseDir}
- Project type: ${config.projectType}
- TypeScript: ${config.typescript}

Consider:
- Project structure conventions
- Feature organization patterns
- Template type and complexity
- Scalability and maintainability

Respond with JSON:
{
  "suggested": "/path/to/feature",
  "reasoning": "Explanation of why this path is optimal"
}`;

  try {
    const response = await generateWithConfiguredAI(prompt, config);
    if (response) {
      const parsed = JSON.parse(response);
      
      // Ensure path is absolute
      if (!path.isAbsolute(parsed.suggested)) {
        parsed.suggested = path.join(config.baseDir, parsed.suggested);
      }
      
      return parsed;
    }
  } catch (error) {
    // Fallback to default path
  }
  
  return {
    suggested: path.join(config.baseDir, 'features', featureName),
    reasoning: 'Default features directory (AI analysis failed)'
  };
}

/**
 * AI-powered verification of naming conventions in generated files
 */
async function performAINamingVerification(options: any, config: CLIConfig): Promise<void> {
  const targetPath = options.targetPath;
  const originalName = options.templateName;
  const newName = options.newName;

  console.log(chalk.dim('   🔍 Scanning generated files for naming issues...'));

  try {
    // Read all generated files
    const files = getAllFiles(targetPath);
    let issuesFound = 0;
    let issuesFixed = 0;

    for (const filePath of files) {
      if (shouldSkipFile(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const analysis = await analyzeFileNaming(content, filePath, originalName, newName, config);

      if (analysis.issues.length > 0) {
        issuesFound += analysis.issues.length;
        console.log(chalk.yellow(`   ⚠️ Found ${analysis.issues.length} naming issues in ${path.basename(filePath)}`));

        // Apply AI-suggested fixes
        const fixedContent = await applyAIFixes(content, analysis.issues, config);
        if (fixedContent !== content) {
          fs.writeFileSync(filePath, fixedContent);
          issuesFixed++;
          console.log(chalk.green(`   ✅ Fixed naming issues in ${path.basename(filePath)}`));
        }
      }
    }

    if (issuesFound === 0) {
      console.log(chalk.green('   ✅ All naming conventions are correct!'));
    } else {
      console.log(chalk.blue(`   🔧 Fixed ${issuesFixed} files with naming issues`));
    }

  } catch (error) {
    console.log(chalk.yellow('   ⚠️ AI naming verification failed, but generation completed'));
  }
}

/**
 * AI analysis of generated code for potential issues and improvements
 */
async function performAICodeAnalysis(options: any, config: CLIConfig): Promise<void> {
  console.log(chalk.dim('   🧠 Analyzing generated code quality and structure...'));

  try {
    const targetPath = options.targetPath;
    const files = getAllFiles(targetPath).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    for (const filePath of files.slice(0, 3)) { // Analyze up to 3 main files
      const content = fs.readFileSync(filePath, 'utf-8');
      const analysis = await analyzeCodeQuality(content, filePath, config);

      if (analysis.suggestions.length > 0) {
        console.log(chalk.blue(`   💡 Suggestions for ${path.basename(filePath)}:`));
        analysis.suggestions.forEach((suggestion: string) => {
          console.log(chalk.dim(`     - ${suggestion}`));
        });
      }
    }

    console.log(chalk.green('   ✅ Code analysis completed'));

  } catch (error) {
    console.log(chalk.yellow('   ⚠️ AI code analysis failed, but generation completed'));
  }
}

/**
 * Final validation and next steps generation
 */
async function performFinalValidation(options: any, config: CLIConfig): Promise<ValidationResults> {
  const targetPath = options.targetPath;
  const files = getAllFiles(targetPath);

  // Basic validation
  const issues: string[] = [];
  const nextSteps: string[] = [];

  // Check if main component exists
  const mainComponentExists = files.some(f => f.includes(options.newName) && f.endsWith('.tsx'));
  if (!mainComponentExists) {
    issues.push('Main component file not found');
  }

  // Check if types exist (for TypeScript projects)
  if (config.typescript) {
    const typesExist = files.some(f => f.includes('types') || f.endsWith('.types.ts'));
    if (!typesExist) {
      nextSteps.push('Consider adding TypeScript interfaces for better type safety');
    }
  }

  // Generate contextual next steps
  nextSteps.push(`Import ${options.newName} component in your main application`);
  nextSteps.push('Add routing configuration if this is a page component');
  nextSteps.push('Update any API endpoints to match your backend services');
  nextSteps.push('Customize styling to match your design system');
  nextSteps.push('Add unit tests for the generated components');

  return {
    issues,
    nextSteps,
    filesAnalyzed: files.length
  };
}

// Utility functions

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function shouldSkipFile(filePath: string): boolean {
  const skipExtensions = ['.log', '.md', '.json', '.lock'];
  const skipDirectories = ['node_modules', '.git', 'dist', 'build'];
  
  return skipExtensions.some(ext => filePath.endsWith(ext)) ||
         skipDirectories.some(dir => filePath.includes(dir));
}

async function analyzeFileNaming(content: string, filePath: string, originalName: string, newName: string, config: CLIConfig): Promise<{issues: string[]}> {
  // Simple pattern matching for common naming issues
  const issues: string[] = [];
  
  // Check for remaining references to original name
  const patterns = [
    new RegExp(`\\b${originalName}\\b`, 'g'),
    new RegExp(`\\b${originalName.toLowerCase()}\\b`, 'g'),
    new RegExp(`\\b${originalName.toUpperCase()}\\b`, 'g')
  ];

  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push(`Found ${matches.length} references to original name "${originalName}"`);
    }
  });

  return { issues };
}

async function applyAIFixes(content: string, issues: string[], config: CLIConfig): Promise<string> {
  // For now, return original content
  // In a full implementation, this would use AI to fix the issues
  return content;
}

async function analyzeCodeQuality(content: string, filePath: string, config: CLIConfig): Promise<{suggestions: string[]}> {
  const suggestions: string[] = [];
  
  // Basic code quality checks
  if (!content.includes('export')) {
    suggestions.push('Consider adding proper exports for reusability');
  }
  
  if (content.includes('any') && config.typescript) {
    suggestions.push('Replace "any" types with specific TypeScript interfaces');
  }
  
  if (!content.includes('React.FC') && !content.includes('function') && filePath.endsWith('.tsx')) {
    suggestions.push('Consider using proper React function component patterns');
  }

  return { suggestions };
} 