import { CLIConfig } from '../config';
import { generateWithGemini } from '../../services/gemini-service';
import { generateWithMistral } from '../../services/mistral-service';
import { isLibraryAIEnabled, isLibraryFeatureEnabled } from '../../config/libraryConfig';
import chalk from 'chalk';

/**
 * Global AI configuration and utility functions
 */
export interface AIConfig {
  enabled: boolean;
  provider: 'gemini' | 'mistral';
  model: string;
  features: {
    codeGeneration: boolean;
    documentation: boolean;
    testing: boolean;
    refactoring: boolean;
  };
}

/**
 * Default AI configuration
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: false,
  provider: 'gemini',
  model: 'gemini-1.5-flash-latest',
  features: {
    codeGeneration: true,
    documentation: true,
    testing: true,
    refactoring: true
  }
};

/**
 * Check if AI is globally enabled and available
 * Checks both library-level and user-level configuration
 */
export function isAIEnabled(config: CLIConfig): boolean {
  // First check if AI is enabled at library level
  if (!isLibraryAIEnabled()) {
    return false;
  }
  // Then check user's project configuration
  return config.aiEnabled === true;
}

/**
 * Check if AI is available for a specific feature
 * Checks both library-level and user-level configuration
 */
export function isAIFeatureEnabled(config: CLIConfig, feature: keyof AIConfig['features']): boolean {
  // First check if the feature is enabled at library level
  const libraryFeatureMap = {
    codeGeneration: 'CODE_GENERATION',
    documentation: 'DOCUMENTATION', 
    testing: 'TESTING',
    refactoring: 'REFACTORING'
  } as const;
  
  if (!isLibraryFeatureEnabled(libraryFeatureMap[feature] as any)) {
    return false;
  }
  
  // Then check user configuration
  return isAIEnabled(config) && DEFAULT_AI_CONFIG.features[feature];
}

/**
 * Get the configured AI provider
 */
export function getAIProvider(config: CLIConfig): 'gemini' | 'mistral' {
  return config.aiProvider || 'gemini';
}

/**
 * Get the configured AI model
 */
export function getAIModel(config: CLIConfig): string {
  return config.aiModel || 'gemini-1.5-flash-latest';
}

/**
 * Generate code using the configured AI provider
 */
export async function generateWithConfiguredAI(
  prompt: string, 
  config: CLIConfig
): Promise<string | null> {
  if (!isAIEnabled(config)) {
    console.log(chalk.yellow('⚠️  AI is disabled in configuration'));
    return null;
  }

  const provider = getAIProvider(config);
  
  try {
    switch (provider) {
      case 'mistral':
        return await generateWithMistral(prompt, config);
      case 'gemini':
      default:
        return await generateWithGemini(prompt, config);
    }
  } catch (error) {
    console.error(chalk.red(`❌ AI generation failed with ${provider}:`), error);
    return null;
  }
}

/**
 * Validate AI configuration
 */
export function validateAIConfig(config: CLIConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (config.aiEnabled) {
    if (!config.aiProvider) {
      errors.push('AI provider not specified');
    }
    
    if (!config.aiModel) {
      errors.push('AI model not specified');
    }
    
    // Check for required environment variables
    const provider = getAIProvider(config);
    if (provider === 'gemini' && !process.env.GEMINI_API_KEY) {
      errors.push('GEMINI_API_KEY environment variable is required for Gemini');
    }
    
    if (provider === 'mistral' && !process.env.MISTRAL_API_KEY) {
      errors.push('MISTRAL_API_KEY environment variable is required for Mistral');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Display AI status information
 */
export function displayAIStatus(config: CLIConfig): void {
  console.log(chalk.cyan('\n🤖 AI Configuration Status:'));
  console.log(`  ${chalk.gray('Enabled:')} ${config.aiEnabled ? '✅' : '❌'}`);
  
  if (config.aiEnabled) {
    console.log(`  ${chalk.gray('Provider:')} ${getAIProvider(config)}`);
    console.log(`  ${chalk.gray('Model:')} ${getAIModel(config)}`);
    
    const validation = validateAIConfig(config);
    if (!validation.valid) {
      console.log(chalk.red('  ⚠️  Configuration Issues:'));
      validation.errors.forEach(error => {
        console.log(chalk.red(`    • ${error}`));
      });
    } else {
      console.log(chalk.green('  ✅ Configuration valid'));
    }
  }
}

/**
 * Check if AI should be offered as an option for interactive commands
 */
export function shouldOfferAI(config: CLIConfig, feature?: keyof AIConfig['features']): boolean {
  if (!isAIEnabled(config)) {
    return false;
  }
  
  if (feature && !isAIFeatureEnabled(config, feature)) {
    return false;
  }
  
  const validation = validateAIConfig(config);
  return validation.valid;
}
