import chalk from 'chalk';
import { generateWithConfiguredAI } from '../utils/config/ai/aiConfig';
import { askQuestion } from '../utils/ai/prompt';
import { TReadlineInterface } from '../types/ReadLineInterface';
import { CLIConfig } from '../utils/config/config';
import { createPage } from '../commands/generate/page/core/pageCore';
import { PageOptions } from '../commands/generate/page/core/pageTypes';
import { createFeatureWithAITemplate, AITemplateService } from './aiTemplateService';
import { listTemplates } from '../utils/template/template';

export interface AIAgentRequest {
  userDescription: string;
  projectType?: string;
  config: CLIConfig;
  rl: TReadlineInterface;
}

export interface AIAgentDecision {
  resourceType: 'page' | 'component' | 'hook' | 'service' | 'utils' | 'types' | 'full-feature' | 'ai-template';
  resourceName: string;
  files: string[];
  options: any;
  reasoning: string;
  commands: string[];
  templateName?: string; // For AI template-based generation
  useAITemplate?: boolean; // Flag to use AI template service
}

export interface AIAgentResponse {
  decisions: AIAgentDecision[];
  projectStructure: string;
  explanation: string;
  nextSteps: string[];
}

/**
 * AI Agent that intelligently analyzes user requirements and makes autonomous decisions
 * about what files, components, and structures to create
 */
export class IntelligentAIAgent {
  private config: CLIConfig;
  private rl: TReadlineInterface;

  constructor(config: CLIConfig, rl: TReadlineInterface) {
    this.config = config;
    this.rl = rl;
  }

  /**
   * Main method that analyzes user request and makes intelligent decisions
   */
  async analyzeAndExecute(userDescription: string): Promise<void> {
    try {
      console.log(chalk.cyan('\n🤖 AI Agent Analyzing Your Request...'));
      console.log(chalk.dim(`User Request: "${userDescription}"`));

      // Step 1: Analyze user requirements with AI
      const aiResponse = await this.getAIAnalysis(userDescription);
      
      if (!aiResponse) {
        console.log(chalk.red('AI analysis failed. Please try again with a more specific description.'));
        return;
      }

      // Step 2: Show AI's plan to user
      await this.presentAIDecisions(aiResponse);

      // Step 3: Confirm with user
      const proceed = await askQuestion(
        this.rl,
        chalk.blue('\nProceed with AI agent\'s plan? (y/n): ')
      );

      if (proceed.toLowerCase() !== 'y') {
        console.log(chalk.yellow('Operation cancelled by user.'));
        return;
      }

      // Step 4: Execute the plan
      await this.executePlan(aiResponse);

      // Step 5: Show completion summary
      this.showCompletionSummary(aiResponse);

    } catch (error) {
      console.error(chalk.red('AI Agent Error:'), error);
    }
  }

  /**
   * Get AI analysis of user requirements
   */
  private async getAIAnalysis(userDescription: string): Promise<AIAgentResponse | null> {
    const prompt = this.buildAnalysisPrompt(userDescription);
    
    console.log(chalk.dim('🧠 AI is analyzing requirements...'));
    const rawResponse = await generateWithConfiguredAI(prompt, this.config);
    
    if (!rawResponse) {
      return null;
    }

    try {
      // Parse AI response
      return this.parseAIResponse(rawResponse);
    } catch (error) {
      console.log(chalk.yellow('Failed to parse AI response, using fallback analysis...'));
      return this.createFallbackResponse(userDescription);
    }
  }

  /**
   * Build comprehensive prompt for AI analysis
   */
  private buildAnalysisPrompt(userDescription: string): string {
    const availableTemplates = listTemplates().map(t => ({
      name: t.name,
      description: t.metadata.description || 'No description',
      files: t.metadata.files || [],
      tags: t.metadata.tags || []
    }));

    return `You are an intelligent React development agent. Analyze the user's request and make autonomous decisions about what files, components, and project structure to create.

USER REQUEST: "${userDescription}"

PROJECT CONTEXT:
- Framework: React with ${this.config.typescript ? 'TypeScript' : 'JavaScript'}
- Project Type: ${this.config.projectType || 'standard React'}
- Base Directory: ${this.config.baseDir}

AVAILABLE TEMPLATES:
${JSON.stringify(availableTemplates, null, 2)}

ANALYZE AND DECIDE:
1. What type of feature/resource is being requested?
2. Should we use an existing template as a base and adapt it with AI?
3. What files and components are needed?
4. What folder structure should be created?
5. What additional utilities, hooks, or services are required?
6. What are the logical next steps after creation?

OUTPUT FORMAT (JSON):
{
  "decisions": [
    {
      "resourceType": "page|component|hook|service|utils|types|full-feature|ai-template",
      "resourceName": "ComponentName",
      "files": ["ComponentName.tsx", "hooks/useComponentName.ts", "types/ComponentName.types.ts"],
      "options": {
        "css": true,
        "test": true,
        "hooks": true,
        "utils": true,
        "types": true,
        "lib": false
      },
      "reasoning": "Explanation of why these files are needed",
      "commands": ["g page ComponentName --hooks --utils --types --css"],
      "templateName": "redux-dashboard",
      "useAITemplate": true
    }
  ],
  "projectStructure": "Visual representation of the folder structure that will be created",
  "explanation": "Overall explanation of the decisions made",
  "nextSteps": ["Suggested next actions for the user"]
}

DECISION RULES:
- If a suitable template exists for the request, prefer using AI template service (resourceType: "ai-template")
- If user wants a "dashboard" or "page" → check for dashboard templates first, fallback to create page with hooks, utils, types, CSS
- If user wants "user management" → check for auth/user templates, fallback to create page + service + types + utils
- If user wants "authentication" → check for auth templates, fallback to create hooks + service + types + guards
- If user wants "data fetching" → check for api/data templates, fallback to create hooks + service + types
- If user wants "form" → check for form templates, fallback to create component + hooks + validation + types
- If user mentions "responsive" → always include CSS
- If user mentions "API" or "data" → always include service and types
- If user mentions "state management" → include hooks and possibly context, check for state templates
- If user mentions "testing" → include test files
- If user mentions specific features like "redux", "router", etc. → check for matching templates

TEMPLATE USAGE RULES:
- Use AI template service when:
  - A template exists that closely matches the request (≥70% match)
  - The request involves complex features that benefit from a template base
  - The user wants a complete, working feature quickly
- Generate from scratch when:
  - No suitable template exists
  - The request is very specific and custom
  - Simple single-file generations

Be intelligent and anticipate what the user really needs, not just what they explicitly asked for.

Provide ONLY the JSON response, no additional text.`;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(response: string): AIAgentResponse {
    // Remove any markdown formatting
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      // Try to extract JSON from the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse AI response as JSON');
    }
  }

  /**
   * Create fallback response when AI parsing fails
   */
  private createFallbackResponse(userDescription: string): AIAgentResponse {
    const isPage = /page|dashboard|screen|view/i.test(userDescription);
    const isComponent = /component|widget|element/i.test(userDescription);
    const needsAPI = /api|data|fetch|service/i.test(userDescription);
    const needsAuth = /auth|login|user|account/i.test(userDescription);
    
    let resourceType: string = 'component';
    let resourceName = 'NewFeature';
    
    if (isPage) resourceType = 'page';
    if (needsAuth) resourceName = 'Authentication';
    if (needsAPI) resourceName = 'DataService';

    return {
      decisions: [{
        resourceType: resourceType as any,
        resourceName,
        files: [`${resourceName}.tsx`, `${resourceName}.module.css`],
        options: {
          css: true,
          hooks: needsAPI || needsAuth,
          utils: needsAPI,
          types: this.config.typescript,
          test: true
        },
        reasoning: `Based on keywords in your request, creating a ${resourceType} with standard files.`,
        commands: [`g ${resourceType} ${resourceName} --css ${needsAPI ? '--hooks --utils' : ''} ${this.config.typescript ? '--types' : ''}`]
      }],
      projectStructure: `${resourceName}/\n├── ${resourceName}.tsx\n├── ${resourceName}.module.css`,
      explanation: `Creating a ${resourceType} based on your description.`,
      nextSteps: [`Test the generated ${resourceType}`, 'Add additional functionality as needed']
    };
  }

  /**
   * Present AI decisions to user for confirmation
   */
  private async presentAIDecisions(response: AIAgentResponse): Promise<void> {
    console.log(chalk.cyan('\n🎯 AI Agent Analysis Complete!'));
    console.log(chalk.white('\n' + response.explanation));

    console.log(chalk.cyan('\n📋 Planned Actions:'));
    response.decisions.forEach((decision, index) => {
      console.log(chalk.blue(`\n${index + 1}. ${decision.resourceType.toUpperCase()}: ${decision.resourceName}`));
      console.log(chalk.dim(`   Reasoning: ${decision.reasoning}`));
      console.log(chalk.dim(`   Files: ${decision.files.join(', ')}`));
      console.log(chalk.green(`   Command: ${decision.commands.join(' && ')}`));
    });

    console.log(chalk.cyan('\n📁 Project Structure:'));
    console.log(chalk.dim(response.projectStructure));

    console.log(chalk.cyan('\n🚀 Next Steps:'));
    response.nextSteps.forEach((step, index) => {
      console.log(chalk.dim(`   ${index + 1}. ${step}`));
    });
  }

  /**
   * Execute the AI's plan
   */
  private async executePlan(response: AIAgentResponse): Promise<void> {
    console.log(chalk.cyan('\n⚡ Executing AI Agent Plan...'));

    for (const decision of response.decisions) {
      console.log(chalk.blue(`\n🔨 Creating ${decision.resourceType}: ${decision.resourceName}`));
      
      try {
        await this.executeDecision(decision);
        console.log(chalk.green(`✅ Successfully created ${decision.resourceName}`));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to create ${decision.resourceName}:`, error));
      }
    }
  }

  /**
   * Execute a single decision
   */
  private async executeDecision(decision: AIAgentDecision): Promise<void> {
    switch (decision.resourceType) {
      case 'ai-template':
        // Use AI Template Service for intelligent template-based generation
        const aiTemplateResult = await createFeatureWithAITemplate(
          `Create ${decision.resourceName} using template ${decision.templateName}`,
          decision.resourceName,
          this.config.baseDir,
          this.config
        );
        
        if (aiTemplateResult.success) {
          console.log(chalk.green(`✅ AI Template generated ${decision.resourceName} successfully`));
          console.log(chalk.dim(`Generated files: ${aiTemplateResult.generatedFiles.length}`));
          console.log(chalk.dim(`Modified files: ${aiTemplateResult.modifiedFiles.length}`));
        } else {
          console.log(chalk.red(`❌ AI Template generation failed for ${decision.resourceName}`));
          aiTemplateResult.errors.forEach(error => console.log(chalk.red(`   Error: ${error}`)));
        }
        break;
        
      case 'page':
        const pageOptions: PageOptions = {
          ...decision.options,
          rl: this.rl,
          aiFeatures: 'AI_AGENT_GENERATED',
          name: decision.resourceName
        };
        await createPage(decision.resourceName, pageOptions, this.config);
        break;
        
      case 'full-feature':
        // Full feature is essentially a page with all possible options
        const fullFeatureOptions: PageOptions = {
          css: true,
          hooks: true,
          utils: true,
          types: this.config.typescript,
          lib: true,
          test: true,
          ...decision.options,
          rl: this.rl,
          aiFeatures: 'AI_AGENT_GENERATED',
          name: decision.resourceName
        };
        await createPage(decision.resourceName, fullFeatureOptions, this.config);
        break;
        
      case 'component':
        // TODO: Implement component creation
        console.log(chalk.yellow(`Component creation not yet implemented for AI agent`));
        break;
        
      case 'hook':
        // TODO: Implement hook creation
        console.log(chalk.yellow(`Hook creation not yet implemented for AI agent`));
        break;
        
      case 'service':
        // TODO: Implement service creation
        console.log(chalk.yellow(`Service creation not yet implemented for AI agent`));
        break;
        
      default:
        console.log(chalk.yellow(`Resource type ${decision.resourceType} not yet supported`));
    }
  }

  /**
   * Show completion summary
   */
  private showCompletionSummary(response: AIAgentResponse): void {
    console.log(chalk.green.bold('\n🎉 AI Agent Execution Complete!'));
    console.log(chalk.cyan('\n📊 Summary:'));
    console.log(chalk.dim(`   Resources Created: ${response.decisions.length}`));
    console.log(chalk.dim(`   Files Generated: ${response.decisions.reduce((acc, d) => acc + d.files.length, 0)}`));
    
    console.log(chalk.cyan('\n🔄 Recommended Next Steps:'));
    response.nextSteps.forEach((step, index) => {
      console.log(chalk.blue(`   ${index + 1}. ${step}`));
    });
    
    console.log(chalk.green('\n✨ Your AI-generated code is ready to use!'));
  }
}

/**
 * Main function to start AI Agent
 */
export async function startAIAgent(config: CLIConfig, rl: TReadlineInterface): Promise<void> {
  const agent = new IntelligentAIAgent(config, rl);
  
  console.log(chalk.cyan.bold('\n🤖 Welcome to the Intelligent AI Agent!'));
  console.log(chalk.white('Describe what you want to build, and I\'ll analyze your needs and create everything automatically.'));
  console.log(chalk.dim('Examples:'));
  console.log(chalk.dim('  - "Create a user dashboard with charts and data tables"'));
  console.log(chalk.dim('  - "Build an authentication system with login and signup"'));
  console.log(chalk.dim('  - "Make a product catalog with search and filters"'));
  console.log(chalk.dim('  - "Create a blog post editor with rich text features"'));
  
  const userRequest = await askQuestion(
    rl,
    chalk.blue('\n💭 What would you like me to build for you? ')
  );
  
  if (!userRequest.trim()) {
    console.log(chalk.yellow('Please provide a description of what you want to build.'));
    return;
  }
  
  await agent.analyzeAndExecute(userRequest);
}
