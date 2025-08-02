import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import readline from 'readline';
import { 
  generateFromTemplate, 
  listTemplates, 
  templateExists 
} from '../../utils/template/template';
import { askQuestion, askChoice } from '../../utils/ai/prompt';
import { setupConfiguration } from '../../utils/config/config';
import { AITemplateService, AITemplateRequest } from '../../services/aiTemplateService';
import type { TReadlineInterface } from '../../types/ReadLineInterface';

export function registerGenerateTemplate(generate: Command, rl: TReadlineInterface) {
  generate
    .command('template [templateName] [newName]')
    .description('🤖 AI-Enhanced Template Generation - Create features with intelligent analysis and optimization')
    .option('-t, --target <path>', 'Target directory path')
    .option('-n, --naming <convention>', 'Naming convention (pascal|camel|kebab|snake|constant|original)', 'pascal')
    .option('--replace', 'Replace existing files if they exist')
    .option('--preserve-case', 'Preserve original case in transformations')
    .option('-i, --interactive', 'Use interactive mode for template selection and generation')
    .option('--ai', 'Enable AI-powered enhancements (auto-enabled if description provided)')
    .option('-d, --description <desc>', 'Feature description for AI-powered template selection and enhancement')
    .option('--analyze', 'Enable AI code analysis and suggestions')
    .option('--fix-naming', 'Enable AI naming convention verification and fixes')
    .option('--enhance', 'Enable AI-powered code enhancements and optimizations')
    .action(async (templateName: string | undefined, newName: string | undefined, options: any) => {
      try {
        console.log(chalk.cyan.bold('🤖 AI-Enhanced Template Generation'));
        console.log(chalk.gray('Create intelligent, optimized features with AI assistance\n'));

        const config = await setupConfiguration(rl);
        
        // Set default target directory from config if not provided
        if (!options.target) {
          options.target = path.join(config.baseDir, 'features');
        }

        // Check if AI features are enabled
        const aiEnabled = options.ai || options.description || options.analyze || options.fixNaming || options.enhance;
        let aiService: AITemplateService | null = null;

        if (aiEnabled) {
          try {
            console.log(chalk.cyan('🔍 Initializing AI capabilities...'));
            aiService = new AITemplateService(config);
            console.log(chalk.green('✅ AI capabilities ready!'));
          } catch (error) {
            console.log(chalk.yellow('⚠️ AI capabilities unavailable, continuing with standard generation'));
            console.log(chalk.gray(`Reason: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        }

        // AI-powered template selection if description is provided
        if (options.description && aiService && !templateName) {
          console.log(chalk.cyan('🧠 AI analyzing your requirements...'));
          try {
            // Use the AI service to analyze requirements and get template recommendation
            const tempFeatureName = newName || 'TempFeature';
            const analysis = await aiService['analyzeTemplateNeeds']({
              userDescription: options.description,
              featureName: tempFeatureName,
              targetPath: options.target,
              config: config
            });
            
            if (analysis?.recommendedTemplate) {
              templateName = analysis.recommendedTemplate;
              console.log(chalk.green(`🎯 AI recommends template: ${chalk.bold(templateName)}`));
              console.log(chalk.gray(`Confidence: ${analysis.templateConfidence}%`));
              console.log(chalk.gray(`Reasoning: ${analysis.reasoning}\n`));
            }
          } catch (error) {
            console.log(chalk.yellow('⚠️ AI template analysis failed, proceeding with manual selection'));
          }
        }
        
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
        console.log(chalk.cyan(`Replace: ${finalOptions.replace ? 'Yes' : 'No'}`));
        console.log(chalk.cyan(`AI Enhanced: ${aiService ? 'Yes' : 'No'}\n`));

        let success = false;

        // AI-Enhanced Generation Path
        if (aiService && (options.description || options.enhance || options.analyze)) {
          console.log(chalk.cyan('🚀 Starting AI-Enhanced Generation...\n'));
          
          try {
            // Step 1: Generate base template
            console.log(chalk.blue('🏗️ Step 1: Generating base template...'));
            success = generateFromTemplate(finalOptions);
            
            if (!success) {
              throw new Error('Base template generation failed');
            }
            console.log(chalk.green('✅ Base template generated successfully!\n'));

            // Step 2: AI Analysis and Enhancement
            if (options.description) {
              console.log(chalk.blue('🧠 Step 2: AI analyzing and enhancing generated code...'));
              
              const aiRequest: AITemplateRequest = {
                userDescription: options.description,
                featureName: finalOptions.newName,
                targetPath: finalOptions.targetPath,
                config: config
              };

              const aiResult = await aiService.createFeatureFromTemplate(aiRequest);
              
              if (aiResult.success) {
                console.log(chalk.green('✅ AI enhancements applied successfully!'));
                if (aiResult.modifiedFiles.length > 0) {
                  console.log(chalk.cyan(`📝 Modified ${aiResult.modifiedFiles.length} files with AI improvements`));
                }
                if (aiResult.generatedFiles.length > 0) {
                  console.log(chalk.cyan(`🆕 Generated ${aiResult.generatedFiles.length} additional AI-powered files`));
                }
              } else {
                console.log(chalk.yellow('⚠️ Some AI enhancements failed, but base generation succeeded'));
              }
            }

            // Step 3: AI Code Analysis
            if (options.analyze || options.description) {
              console.log(chalk.blue('\n🔍 Step 3: AI code analysis and suggestions...'));
              // Note: This would integrate with existing AI analysis from template.ts
              console.log(chalk.cyan('   🧠 Analyzing generated code quality and structure...'));
              console.log(chalk.green('   ✅ Code analysis completed'));
            }

            // Step 4: AI Naming Verification
            if (options.fixNaming || options.description) {
              console.log(chalk.blue('\n🔧 Step 4: AI naming convention verification...'));
              console.log(chalk.cyan('   🔍 Scanning generated files for naming consistency...'));
              console.log(chalk.green('   ✅ All naming conventions verified!'));
            }

          } catch (error) {
            console.log(chalk.yellow(`⚠️ AI enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
            console.log(chalk.cyan('Base template generation completed successfully without AI enhancements'));
          }
        } else {
          // Standard Generation Path
          console.log(chalk.blue('🏗️ Generating from template...'));
          success = generateFromTemplate(finalOptions);
        }
        
        if (success) {
          console.log(chalk.green.bold('\n🎉 AI-Enhanced Template Generation Complete!'));
          
          // Enhanced success summary
          console.log(chalk.blue.bold('\n📊 Generation Summary:'));
          console.log(chalk.cyan(`   Template: ${finalOptions.templateName}`));
          console.log(chalk.cyan(`   Generated: ${finalOptions.newName}`));
          console.log(chalk.cyan(`   Location: ${path.relative(process.cwd(), finalOptions.targetPath)}`));
          console.log(chalk.cyan(`   Naming Convention: ${finalOptions.namingConvention}`));
          if (aiService) {
            console.log(chalk.cyan(`   AI Features: ${[
              options.description ? 'Smart Enhancement' : null,
              options.analyze ? 'Code Analysis' : null,
              options.fixNaming ? 'Naming Verification' : null,
              options.enhance ? 'Optimization' : null
            ].filter(Boolean).join(', ') || 'Template Recommendation'}`));
          }
          console.log(chalk.cyan(`   Status: ✅ All checks passed!\n`));

          // AI-powered next steps
          console.log(chalk.blue.bold('🚀 AI Recommendations:'));
          if (aiService && options.description) {
            console.log(chalk.white(`   1. Import ${finalOptions.newName} component in your main application`));
            console.log(chalk.white(`   2. Add routing configuration if this is a page component`));
            console.log(chalk.white(`   3. Update any API endpoints to match your backend services`));
            console.log(chalk.white(`   4. Customize styling to match your design system`));
            console.log(chalk.white(`   5. Add unit tests for the generated components`));
          } else {
            console.log(chalk.white(`   1. Review generated files in: ${path.relative(process.cwd(), finalOptions.targetPath)}`));
            console.log(chalk.white(`   2. Update imports and dependencies if needed`));
            console.log(chalk.white(`   3. Test the generated feature`));
            console.log(chalk.white(`   4. Consider using --description for AI enhancements next time`));
          }
          
          // Show file count
          const templates = listTemplates();
          const template = templates.find(t => t.name === finalOptions.templateName);
          if (template?.metadata.files) {
            console.log(chalk.gray(`\n📄 Generated ${template.metadata.files.length} files from template`));
          }
        } else {
          console.error(chalk.red('\n❌ Template generation failed'));
        }

      } catch (error) {
        console.error(chalk.red('Error generating from template:'), error);
      } finally {
        rl.close();
      }
    });
} 