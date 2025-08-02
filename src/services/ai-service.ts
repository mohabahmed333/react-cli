import { generateWithGemini } from './gemini-service';
import { generateWithMistral } from './mistral-service';
import type { CLIConfig } from '../utils/config/config';
import chalk from 'chalk';

export type AIProvider = 'gemini' | 'mistral';

export const generateWithAI = async (prompt: string, config: CLIConfig): Promise<string | null> => {
  try {
    switch (config.aiProvider) {
      case 'mistral':
        console.log(chalk.cyan('🤖 Generating with Mistral AI...'));
        return await generateWithMistral(prompt, config);
      case 'gemini':
      default:
        console.log(chalk.cyan('🧠 Generating with Gemini AI...'));
        return await generateWithGemini(prompt, config);
    }
  } catch (error) {
    console.error(chalk.red('AI Service Error:'), error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

export const getAIProviderDisplayName = (provider: AIProvider): string => {
  switch (provider) {
    case 'mistral':
      return 'Mistral AI';
    case 'gemini':
      return 'Google Gemini';
    default:
      return 'Unknown AI Provider';
  }
};

export const validateAIProvider = (provider: string): provider is AIProvider => {
  return ['gemini', 'mistral'].includes(provider);
};

export const getAvailableModels = (provider: AIProvider): string[] => {
  switch (provider) {
    case 'mistral':
      return [
        'mistral-large-latest',
        'mistral-medium-latest',
        'mistral-small-latest'
      ];
    case 'gemini':
      return [
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'gemini-pro-latest'
      ];
    default:
      return [];
  }
};

export const getDefaultModel = (provider: AIProvider): string => {
  switch (provider) {
    case 'mistral':
      return 'mistral-large-latest';
    case 'gemini':
      return 'gemini-1.5-flash-latest';
    default:
      return 'gemini-1.5-flash-latest';
  }
};

export const getRequiredEnvKey = (provider: AIProvider): string => {
  switch (provider) {
    case 'mistral':
      return 'MISTRAL_API_KEY';
    case 'gemini':
      return 'GEMINI_API_KEY';
    default:
      return 'GEMINI_API_KEY';
  }
};
