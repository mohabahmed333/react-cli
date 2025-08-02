import { Mistral } from '@mistralai/mistralai';
import chalk from 'chalk';
import dotenv from 'dotenv';
import type { CLIConfig } from '../utils/config/config';

// Load environment variables
const result = dotenv.config();
if (result.error) {
  console.error(chalk.red('Error loading .env file:'), result.error);
}

// Response cache
const responseCache = new Map<string, string>();

// Default templates for local fallback
const defaultTemplates: Record<string, string> = {
  component: `import React from 'react';

export interface Props {
  // Add props here
}

export const Component: React.FC<Props> = (props) => {
  return (
    <div>
      {/* Add component content */}
    </div>
  );
};`,
  hook: `import { useState, useEffect } from 'react';

export const useHook = () => {
  const [state, setState] = useState();

  useEffect(() => {
    // Add effect logic
  }, []);

  return state;
};`,
  util: `export const utilFunction = () => {
  // Add utility logic here
  return null;
};`,
  type: `export interface TypeInterface {
  // Add type properties here
}

export type TypeAlias = string | number;`,
  page: `import React from 'react';

const Page: React.FC = () => {
  return (
    <div>
      {/* Add page content */}
    </div>
  );
};

export default Page;`
};

function getDefaultTemplate(prompt: string): string | null {
  // Try to determine the type of content being requested
  if (prompt.toLowerCase().includes('component')) return defaultTemplates.component;
  if (prompt.toLowerCase().includes('hook')) return defaultTemplates.hook;
  if (prompt.toLowerCase().includes('util')) return defaultTemplates.util;
  if (prompt.toLowerCase().includes('type')) return defaultTemplates.type;
  if (prompt.toLowerCase().includes('page')) return defaultTemplates.page;
  return null;
}

async function generateWithRetry(
  client: Mistral,
  model: string,
  prompt: string,
  retries = 3,
  backoffDelay = 1000
): Promise<string | null> {
  const systemMessage = `You are an expert developer. Generate high-quality, production-ready code without explanations. Follow these rules:
1. Use modern syntax and best practices
2. Include TypeScript types when applicable
3. Keep components focused and modular
4. Export all necessary elements
5. Return only code, no markdown formatting or explanations`;

  try {
    const response = await client.chat.complete({
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      maxTokens: 2000
    });
    
    const content = response.choices[0]?.message?.content;
    return typeof content === 'string' ? content : '';
  } catch (error) {
    if (error instanceof Error) {
      // Handle rate limiting or overload
      if ((error.message.includes('overloaded') || error.message.includes('rate') || error.message.includes('429')) && retries > 0) {
        const delay = Math.pow(2, 4 - retries) * backoffDelay; // Exponential backoff
        console.log(chalk.yellow(`Mistral API overloaded. Retrying in ${delay/1000} seconds...`));
        await new Promise(res => setTimeout(res, delay));
        return generateWithRetry(client, model, prompt, retries - 1, backoffDelay);
      }
      
      // Try fallback model if primary fails
      if (model === 'mistral-large-latest') {
        console.log(chalk.yellow('Falling back to smaller Mistral model...'));
        try {
          return generateWithRetry(client, 'mistral-medium-latest', prompt, 0, backoffDelay);
        } catch (fallbackError) {
          console.error(chalk.red('Mistral fallback model error:'), fallbackError instanceof Error ? fallbackError.message : 'Unknown error');
        }
      }
    }
    
    // If all retries and fallbacks fail, return null
    console.error(chalk.red('Mistral Error:'), error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export const generateWithMistral = async (prompt: string, config: CLIConfig): Promise<string | null> => {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      console.error(chalk.red('Error: MISTRAL_API_KEY not found in .env'));
      console.log(chalk.yellow('Please ensure:'));
      console.log(chalk.yellow('1. You have created a .env file in the project root'));
      console.log(chalk.yellow('2. The file contains: MISTRAL_API_KEY=your_key_here'));
      console.log(chalk.yellow('3. There are no spaces around the = sign'));
      return null;
    }

    // Check cache first
    const cacheKey = `mistral_${prompt}_${config.aiModel}`;
    if (responseCache.has(cacheKey)) {
      console.log(chalk.cyan('Using cached Mistral response...'));
      return responseCache.get(cacheKey) || null;
    }

    const client = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY || ''
    });
    
    const response = await generateWithRetry(
      client,
      config.aiModel || 'mistral-large-latest',
      prompt
    );

    if (response) {
      // Cache successful response
      responseCache.set(cacheKey, response);
      return response;
    }

    // If API completely fails, try local fallback
    console.log(chalk.yellow('Mistral API failed. Using local template...'));
    const defaultContent = getDefaultTemplate(prompt);
    if (defaultContent) {
      console.log(chalk.yellow('Using default template as fallback.'));
      return defaultContent;
    }

    return null;
  } catch (error) {
    console.error(chalk.red('Unexpected Mistral error:'), error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

export const generateCode = async (prompt: string, context: any = {}): Promise<string> => {
  const systemMessage = `You are an expert ${context.projectType} developer. Generate high-quality, production-ready code in ${context.typescript ? 'TypeScript' : 'JavaScript'} without explanations. Follow these rules:
1. Use modern syntax and best practices
2. ${context.typescript ? 'Include TypeScript types' : 'Use JSDoc for type hints'}
3. Keep components focused and modular
4. ${context.localization ? 'Support [lang] localization' : ''}
5. Export all necessary elements`;

  try {
    if (!process.env.MISTRAL_API_KEY) {
      console.error(chalk.red('Error: MISTRAL_API_KEY not found in .env'));
      return '';
    }

    const client = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY || ''
    });
    
    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      maxTokens: 2000
    });
    
    const content = response.choices[0]?.message?.content;
    return typeof content === 'string' ? content : '';
  } catch (error) {
    console.error(chalk.red('AI generation error:'), error);
    return '';
  }
};
