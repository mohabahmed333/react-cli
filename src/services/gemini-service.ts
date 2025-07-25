import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import chalk from 'chalk';
import dotenv from 'dotenv';
import type { CLIConfig } from '../utils/config';

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
  story: `import { Story, Meta } from '@storybook/react';
import { Component } from './Component';

export default {
  title: 'Components/Component',
  component: Component,
} as Meta;

const Template: Story = (args) => <Component {...args} />;

export const Default = Template.bind({});
Default.args = {};`,
  docs: `# Component

## Description
Add component description here.

## Props
| Name | Type | Description |
|------|------|-------------|
| prop | type | description |

## Usage
\`\`\`tsx
import { Component } from './Component';

const Example = () => <Component />;
\`\`\`
`
};

interface SafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

function getDefaultTemplate(prompt: string): string | null {
  // Try to determine the type of content being requested
  if (prompt.toLowerCase().includes('component')) return defaultTemplates.component;
  if (prompt.toLowerCase().includes('hook')) return defaultTemplates.hook;
  if (prompt.toLowerCase().includes('story') || prompt.toLowerCase().includes('storybook')) return defaultTemplates.story;
  if (prompt.toLowerCase().includes('documentation') || prompt.toLowerCase().includes('docs')) return defaultTemplates.docs;
  return null;
}

async function generateWithRetry(
  genAI: GoogleGenerativeAI,
  model: string,
  prompt: string,
  safetySettings: SafetySetting[] | undefined,
  retries = 3,
  backoffDelay = 1000
): Promise<string | null> {
  try {
    // Try primary model first
    const primaryModel = genAI.getGenerativeModel({ 
      model,
      safetySettings
    });
    
    const result = await primaryModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (error instanceof Error) {
      // Handle rate limiting or overload
      if ((error.message.includes('overloaded') || error.message.includes('rate')) && retries > 0) {
        const delay = Math.pow(2, 4 - retries) * backoffDelay; // Exponential backoff
        console.log(chalk.yellow(`API overloaded. Retrying in ${delay/1000} seconds...`));
        await new Promise(res => setTimeout(res, delay));
        return generateWithRetry(genAI, model, prompt, safetySettings, retries - 1, backoffDelay);
      }
      
      // Try fallback model if primary fails
      if (model === 'gemini-1.5-pro-latest' || model === 'gemini-pro-latest') {
        console.log(chalk.yellow('Falling back to simpler model...'));
        try {
          const fallbackModel = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash-latest',
            safetySettings
          });
          const result = await fallbackModel.generateContent(prompt);
          return result.response.text();
        } catch (fallbackError) {
          console.error(chalk.red('Fallback model error:'), fallbackError instanceof Error ? fallbackError.message : 'Unknown error');
        }
      }
    }
    
    // If all retries and fallbacks fail, return null
    console.error(chalk.red('Gemini Error:'), error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export const generateWithGemini = async (prompt: string, config: CLIConfig): Promise<string | null> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error(chalk.red('Error: GEMINI_API_KEY not found in .env'));
      console.log(chalk.yellow('Please ensure:'));
      console.log(chalk.yellow('1. You have created a .env file in the project root'));
      console.log(chalk.yellow('2. The file contains: GEMINI_API_KEY=your_key_here'));
      console.log(chalk.yellow('3. There are no spaces around the = sign'));
      return null;
    }

    // Check cache first
    const cacheKey = `${prompt}_${config.aiModel}`;
    if (responseCache.has(cacheKey)) {
      console.log(chalk.cyan('Using cached response...'));
      return responseCache.get(cacheKey) || null;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const safetySettings = config.aiSafetySettings?.map(setting => ({
      category: setting.category as HarmCategory,
      threshold: setting.threshold as HarmBlockThreshold
    }));

    const response = await generateWithRetry(
      genAI,
      config.aiModel || 'gemini-1.5-flash-latest',
      prompt,
      safetySettings
    );

    if (response) {
      // Cache successful response
      responseCache.set(cacheKey, response);
      return response;
    }

    // If API completely fails, try local fallback
    console.log(chalk.yellow('API failed. Using local template...'));
    const defaultContent = getDefaultTemplate(prompt);
    if (defaultContent) {
      console.log(chalk.yellow('Using default template as fallback.'));
      return defaultContent;
    }

    return null;
  } catch (error) {
    console.error(chalk.red('Unexpected error:'), error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}; 