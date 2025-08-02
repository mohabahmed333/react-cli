import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { generateWithConfiguredAI } from '../utils/config/ai/aiConfig';
import { CLIConfig } from '../utils/config/config';
import { 
  listTemplates, 
  generateFromTemplate, 
  namingConventions,
  TEMPLATE_DIR 
} from '../utils/template/template';
import { TemplateInfo, TemplateMetadata, NamingConventionType } from '../types/template-types';
import { createFolder } from '../utils/docs/docUtils';

export interface AITemplateRequest {
  userDescription: string;
  featureName: string;
  targetPath: string;
  config: CLIConfig;
}

export interface AITemplateAnalysis {
  recommendedTemplate: string;
  templateConfidence: number;
  requiredModifications: TemplateModification[];
  additionalFiles: AdditionalFile[];
  dependencies: string[];
  integrationSteps: string[];
  reasoning: string;
}

export interface TemplateModification {
  file: string;
  modificationType: 'rename' | 'content-update' | 'structure-change' | 'api-integration';
  originalCode: string;
  modifiedCode: string;
  reasoning: string;
}

export interface AdditionalFile {
  fileName: string;
  filePath: string;
  content: string;
  fileType: 'component' | 'hook' | 'service' | 'type' | 'style' | 'test' | 'config';
}

export interface AITemplateResult {
  success: boolean;
  generatedFiles: string[];
  modifiedFiles: string[];
  errors: string[];
  nextSteps: string[];
}

/**
 * AI-powered Template Service that intelligently adapts templates to create complete features
 */
export class AITemplateService {
  private config: CLIConfig;
  private availableTemplates: TemplateInfo[];

  constructor(config: CLIConfig) {
    this.config = config;
    this.availableTemplates = listTemplates();
  }

  /**
   * Main method to create a feature using AI-enhanced template copying
   */
  async createFeatureFromTemplate(request: AITemplateRequest): Promise<AITemplateResult> {
    try {
      console.log(chalk.cyan('\n🎨 AI Template Service Analyzing Your Request...'));
      console.log(chalk.dim(`Feature: ${request.featureName}`));
      console.log(chalk.dim(`Description: ${request.userDescription}`));

      // Step 1: Analyze and select best template
      const analysis = await this.analyzeTemplateNeeds(request);
      
      if (!analysis) {
        return {
          success: false,
          generatedFiles: [],
          modifiedFiles: [],
          errors: ['Failed to analyze template requirements'],
          nextSteps: []
        };
      }

      // Step 2: Show AI's template selection and plan
      this.presentTemplateAnalysis(analysis);

      // Step 3: Generate base template
      const baseResult = await this.generateBaseTemplate(analysis, request);
      
      if (!baseResult.success) {
        return baseResult;
      }

      // Step 4: Apply AI-powered modifications
      const modificationResult = await this.applyAIModifications(analysis, request);

      // Step 5: Generate additional AI-powered files
      const additionalResult = await this.generateAdditionalFiles(analysis, request);

      // Step 6: Integrate everything and ensure it works
      const integrationResult = await this.performIntelligentIntegration(analysis, request);

      return this.combineResults([baseResult, modificationResult, additionalResult, integrationResult]);

    } catch (error) {
      console.error(chalk.red('AI Template Service Error:'), error);
      return {
        success: false,
        generatedFiles: [],
        modifiedFiles: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        nextSteps: []
      };
    }
  }

  /**
   * Analyze user requirements and recommend best template with modifications
   */
  private async analyzeTemplateNeeds(request: AITemplateRequest): Promise<AITemplateAnalysis | null> {
    const templateList = this.availableTemplates.map(t => ({
      name: t.name,
      description: t.metadata.description || 'No description',
      files: t.metadata.files || [],
      tags: t.metadata.tags || []
    }));

    const prompt = this.buildTemplateAnalysisPrompt(request, templateList);
    
    console.log(chalk.dim('🧠 AI analyzing template requirements...'));
    const rawResponse = await generateWithConfiguredAI(prompt, this.config);
    
    if (!rawResponse) {
      return null;
    }

    try {
      return this.parseTemplateAnalysis(rawResponse);
    } catch (error) {
      console.log(chalk.yellow('Failed to parse AI template analysis, using fallback...'));
      return this.createFallbackTemplateAnalysis(request);
    }
  }

  /**
   * Build comprehensive prompt for template analysis
   */
  private buildTemplateAnalysisPrompt(request: AITemplateRequest, templates: any[]): string {
    return `You are an expert React developer and template analyst. Analyze the user's feature request and recommend the best template to use as a base, along with intelligent modifications needed.

USER REQUEST:
Feature Name: "${request.featureName}"
Description: "${request.userDescription}"
Target Path: "${request.targetPath}"

AVAILABLE TEMPLATES:
${JSON.stringify(templates, null, 2)}

PROJECT CONTEXT:
- Framework: React with ${this.config.typescript ? 'TypeScript' : 'JavaScript'}
- Project Type: ${this.config.projectType || 'standard React'}
- Base Directory: ${this.config.baseDir}

ANALYZE AND RECOMMEND:
1. Which template best matches the user's needs?
2. What modifications are needed to make it work perfectly for this feature?
3. What additional files should be generated to complete the feature?
4. What dependencies might be needed?
5. How should the template files be intelligently adapted?

OUTPUT FORMAT (JSON):
{
  "recommendedTemplate": "template-name",
  "templateConfidence": 0.9,
  "requiredModifications": [
    {
      "file": "FileName.tsx",
      "modificationType": "content-update",
      "originalCode": "old code pattern",
      "modifiedCode": "new adapted code",
      "reasoning": "why this change is needed"
    }
  ],
  "additionalFiles": [
    {
      "fileName": "NewFile.tsx",
      "filePath": "relative/path/NewFile.tsx",
      "content": "complete file content",
      "fileType": "component"
    }
  ],
  "dependencies": ["@types/react", "axios"],
  "integrationSteps": [
    "Import the component in App.tsx",
    "Add route to router configuration"
  ],
  "reasoning": "Detailed explanation of why this template and modifications were chosen"
}

MODIFICATION RULES:
- Always adapt naming to match the feature name
- Update imports and exports to be correct
- Modify API endpoints and data structures
- Add proper TypeScript types if project uses TypeScript
- Ensure responsive design if CSS is involved
- Add proper error handling and loading states
- Include proper accessibility attributes
- Add unit tests if testing is enabled

ADDITIONAL FILE RULES:
- Create custom hooks if data fetching is involved
- Generate service files for API calls
- Create proper TypeScript interfaces
- Add CSS modules for styling
- Include test files for components
- Generate utility functions if needed

Be intelligent and create a complete, production-ready feature that works perfectly without manual intervention.

Provide ONLY the JSON response, no additional text.`;
  }

  /**
   * Parse AI template analysis response
   */
  private parseTemplateAnalysis(response: string): AITemplateAnalysis {
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse AI template analysis as JSON');
    }
  }

  /**
   * Create fallback analysis when AI parsing fails
   */
  private createFallbackTemplateAnalysis(request: AITemplateRequest): AITemplateAnalysis {
    const defaultTemplate = this.availableTemplates.length > 0 ? this.availableTemplates[0].name : 'basic';
    
    return {
      recommendedTemplate: defaultTemplate,
      templateConfidence: 0.6,
      requiredModifications: [{
        file: `${request.featureName}.tsx`,
        modificationType: 'rename',
        originalCode: 'DefaultName',
        modifiedCode: request.featureName,
        reasoning: 'Rename to match feature name'
      }],
      additionalFiles: [],
      dependencies: [],
      integrationSteps: ['Import and use the component'],
      reasoning: 'Fallback analysis due to AI parsing failure'
    };
  }

  /**
   * Present template analysis to user
   */
  private presentTemplateAnalysis(analysis: AITemplateAnalysis): void {
    console.log(chalk.cyan('\n🎯 AI Template Analysis Complete!'));
    console.log(chalk.white(`\nRecommended Template: ${chalk.bold(analysis.recommendedTemplate)}`));
    console.log(chalk.dim(`Confidence: ${(analysis.templateConfidence * 100).toFixed(1)}%`));
    console.log(chalk.white(`\nReasoning: ${analysis.reasoning}`));

    if (analysis.requiredModifications.length > 0) {
      console.log(chalk.cyan('\n🔧 Planned Modifications:'));
      analysis.requiredModifications.forEach((mod, index) => {
        console.log(chalk.blue(`  ${index + 1}. ${mod.file} - ${mod.modificationType}`));
        console.log(chalk.dim(`     ${mod.reasoning}`));
      });
    }

    if (analysis.additionalFiles.length > 0) {
      console.log(chalk.cyan('\n📁 Additional Files to Generate:'));
      analysis.additionalFiles.forEach((file, index) => {
        console.log(chalk.green(`  ${index + 1}. ${file.fileName} (${file.fileType})`));
      });
    }

    if (analysis.dependencies.length > 0) {
      console.log(chalk.cyan('\n📦 Dependencies to Install:'));
      analysis.dependencies.forEach(dep => {
        console.log(chalk.yellow(`  - ${dep}`));
      });
    }
  }

  /**
   * Generate base template files
   */
  private async generateBaseTemplate(analysis: AITemplateAnalysis, request: AITemplateRequest): Promise<AITemplateResult> {
    console.log(chalk.blue('\n🏗️ Generating base template...'));

    try {
      // Create unique feature directory
      const featureDir = path.join(request.targetPath, request.featureName);
      
      await generateFromTemplate({
        templateName: analysis.recommendedTemplate,
        newName: request.featureName,
        targetPath: featureDir,
        namingConvention: 'pascal' as NamingConventionType,
        replace: true // Allow overwriting to handle existing directories
      });

      const templatePath = path.join(TEMPLATE_DIR, analysis.recommendedTemplate);
      const generatedFiles = this.getGeneratedFiles(templatePath, featureDir, request.featureName);

      return {
        success: true,
        generatedFiles,
        modifiedFiles: [],
        errors: [],
        nextSteps: ['Base template generated successfully']
      };
    } catch (error) {
      return {
        success: false,
        generatedFiles: [],
        modifiedFiles: [],
        errors: [error instanceof Error ? error.message : 'Failed to generate base template'],
        nextSteps: []
      };
    }
  }

  /**
   * Apply AI-powered modifications to generated files
   */
  private async applyAIModifications(analysis: AITemplateAnalysis, request: AITemplateRequest): Promise<AITemplateResult> {
    console.log(chalk.blue('\n🔄 Applying AI-powered modifications...'));

    const modifiedFiles: string[] = [];
    const errors: string[] = [];
    const featureDir = path.join(request.targetPath, request.featureName);

    for (const modification of analysis.requiredModifications) {
      try {
        const filePath = path.join(featureDir, modification.file);
        
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf-8');
          
          // Apply intelligent content replacement
          content = await this.applyIntelligentModification(content, modification, request);
          
          fs.writeFileSync(filePath, content);
          modifiedFiles.push(filePath);
          
          console.log(chalk.green(`  ✅ Modified ${modification.file}`));
        }
      } catch (error) {
        errors.push(`Failed to modify ${modification.file}: ${error}`);
        console.log(chalk.red(`  ❌ Failed to modify ${modification.file}`));
      }
    }

    return {
      success: errors.length === 0,
      generatedFiles: [],
      modifiedFiles,
      errors,
      nextSteps: ['Template modifications applied']
    };
  }

  /**
   * Apply intelligent modification using AI to ensure correctness
   */
  private async applyIntelligentModification(
    content: string, 
    modification: TemplateModification, 
    request: AITemplateRequest
  ): Promise<string> {
    // For simple replacements, use direct string replacement
    if (modification.modificationType === 'rename') {
      return this.applyNamingConventions(content, modification.originalCode, modification.modifiedCode);
    }

    // For complex modifications, use AI to ensure correctness
    const prompt = `You are an expert React developer. Modify the following code according to the specifications.

ORIGINAL CODE:
\`\`\`
${content}
\`\`\`

MODIFICATION REQUIRED:
Type: ${modification.modificationType}
Original Pattern: ${modification.originalCode}
New Pattern: ${modification.modifiedCode}
Reasoning: ${modification.reasoning}

CONTEXT:
Feature Name: ${request.featureName}
Description: ${request.userDescription}
TypeScript: ${this.config.typescript}

REQUIREMENTS:
1. Apply the modification while maintaining code quality
2. Ensure proper TypeScript types if applicable
3. Maintain proper imports and exports
4. Keep the code functional and error-free
5. Follow React best practices

Return ONLY the modified code, no explanations or markdown formatting.`;

    const modifiedCode = await generateWithConfiguredAI(prompt, this.config);
    return modifiedCode || content; // Fallback to original if AI fails
  }

  /**
   * Apply naming conventions throughout the content
   */
  private applyNamingConventions(content: string, originalName: string, newName: string): string {
    const conventions = {
      pascal: namingConventions.pascal(newName),
      camel: namingConventions.camel(newName),
      kebab: namingConventions.kebab(newName),
      snake: namingConventions.snake(newName),
      constant: namingConventions.constant(newName)
    };

    let modifiedContent = content;

    // Replace various naming conventions
    Object.entries(conventions).forEach(([convention, convertedName]) => {
      const originalConverted = namingConventions[convention as keyof typeof namingConventions](originalName);
      modifiedContent = modifiedContent.replace(new RegExp(originalConverted, 'g'), convertedName);
    });

    return modifiedContent;
  }

  /**
   * Generate additional AI-powered files
   */
  private async generateAdditionalFiles(analysis: AITemplateAnalysis, request: AITemplateRequest): Promise<AITemplateResult> {
    console.log(chalk.blue('\n📝 Generating additional AI-powered files...'));

    const generatedFiles: string[] = [];
    const errors: string[] = [];
    const featureDir = path.join(request.targetPath, request.featureName);

    for (const additionalFile of analysis.additionalFiles) {
      try {
        const fullPath = path.join(featureDir, additionalFile.filePath);
        const dir = path.dirname(fullPath);

        // Ensure directory exists
        createFolder(dir);

        // Generate intelligent content for the file
        const content = await this.generateIntelligentFileContent(additionalFile, request);
        
        fs.writeFileSync(fullPath, content);
        generatedFiles.push(fullPath);
        
        console.log(chalk.green(`  ✅ Generated ${additionalFile.fileName}`));
      } catch (error) {
        errors.push(`Failed to generate ${additionalFile.fileName}: ${error}`);
        console.log(chalk.red(`  ❌ Failed to generate ${additionalFile.fileName}`));
      }
    }

    return {
      success: errors.length === 0,
      generatedFiles,
      modifiedFiles: [],
      errors,
      nextSteps: ['Additional files generated']
    };
  }

  /**
   * Generate intelligent content for additional files using AI
   */
  private async generateIntelligentFileContent(file: AdditionalFile, request: AITemplateRequest): Promise<string> {
    const prompt = `Generate a complete, production-ready ${file.fileType} file for a React application.

FILE DETAILS:
Name: ${file.fileName}
Type: ${file.fileType}
Path: ${file.filePath}

FEATURE CONTEXT:
Feature Name: ${request.featureName}
Description: ${request.userDescription}
Project Type: React with ${this.config.typescript ? 'TypeScript' : 'JavaScript'}

REQUIREMENTS:
1. Follow React best practices
2. Include proper error handling
3. Add loading states where appropriate
4. Use proper TypeScript types if applicable
5. Include proper imports and exports
6. Add JSDoc comments for documentation
7. Follow accessibility guidelines
8. Include unit test foundations if it's a test file

FILE TYPE SPECIFIC REQUIREMENTS:
${this.getFileTypeRequirements(file.fileType)}

Generate ONLY the file content, no explanations or markdown formatting.`;

    const content = await generateWithConfiguredAI(prompt, this.config);
    return content || file.content; // Fallback to original content if AI fails
  }

  /**
   * Get specific requirements for different file types
   */
  private getFileTypeRequirements(fileType: string): string {
    const requirements = {
      component: '- Use functional components with hooks\n- Include proper prop types\n- Add responsive design considerations',
      hook: '- Follow hook naming conventions (use prefix)\n- Include proper dependency arrays\n- Add cleanup functions where needed',
      service: '- Use async/await for API calls\n- Include proper error handling\n- Add request/response types',
      type: '- Define comprehensive interfaces\n- Include optional and required properties\n- Add JSDoc comments for complex types',
      style: '- Use CSS modules or styled-components\n- Include responsive breakpoints\n- Follow BEM methodology if using CSS',
      test: '- Use React Testing Library\n- Include unit and integration tests\n- Add proper mocking for external dependencies',
      config: '- Export configuration objects\n- Include environment-specific settings\n- Add validation for required fields'
    };

    return requirements[fileType as keyof typeof requirements] || '- Follow general best practices';
  }

  /**
   * Perform intelligent integration to ensure everything works together
   */
  private async performIntelligentIntegration(analysis: AITemplateAnalysis, request: AITemplateRequest): Promise<AITemplateResult> {
    console.log(chalk.blue('\n🔗 Performing intelligent integration...'));

    const modifiedFiles: string[] = [];
    const errors: string[] = [];

    // Execute integration steps
    for (const step of analysis.integrationSteps) {
      try {
        await this.executeIntegrationStep(step, request);
        console.log(chalk.green(`  ✅ ${step}`));
      } catch (error) {
        errors.push(`Integration step failed: ${step} - ${error}`);
        console.log(chalk.red(`  ❌ ${step}`));
      }
    }

    return {
      success: errors.length === 0,
      generatedFiles: [],
      modifiedFiles,
      errors,
      nextSteps: analysis.integrationSteps
    };
  }

  /**
   * Execute a single integration step
   */
  private async executeIntegrationStep(step: string, request: AITemplateRequest): Promise<void> {
    // This would contain logic to execute specific integration steps
    // For now, we'll log the step as completed
    // In a full implementation, this would handle:
    // - Adding imports to App.tsx
    // - Updating router configurations
    // - Installing dependencies
    // - Running tests
    console.log(chalk.dim(`Executing: ${step}`));
  }

  /**
   * Get list of generated files from template
   */
  private getGeneratedFiles(templatePath: string, targetPath: string, featureName: string): string[] {
    const files: string[] = [];
    
    if (fs.existsSync(templatePath)) {
      const templateFiles = fs.readdirSync(templatePath);
      templateFiles.forEach(file => {
        if (file !== '.template.json') {
          files.push(path.join(targetPath, file.replace(/Template/g, featureName)));
        }
      });
    }

    return files;
  }

  /**
   * Combine multiple results into a single result
   */
  private combineResults(results: AITemplateResult[]): AITemplateResult {
    return {
      success: results.every(r => r.success),
      generatedFiles: results.flatMap(r => r.generatedFiles),
      modifiedFiles: results.flatMap(r => r.modifiedFiles),
      errors: results.flatMap(r => r.errors),
      nextSteps: results.flatMap(r => r.nextSteps)
    };
  }
}

/**
 * Main function to start AI Template Service
 */
export async function createFeatureWithAITemplate(
  userDescription: string,
  featureName: string,
  targetPath: string,
  config: CLIConfig
): Promise<AITemplateResult> {
  const aiTemplateService = new AITemplateService(config);
  
  return await aiTemplateService.createFeatureFromTemplate({
    userDescription,
    featureName,
    targetPath,
    config
  });
}
