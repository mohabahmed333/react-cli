import { ComponentOptions } from '../core/componentTypes';

/**
 * Generate AI prompt for component generation
 */
export function generateComponentAIPrompt(name: string, options: ComponentOptions, useTS: boolean): string {
  const features = [
    options.css && 'CSS modules',
    options.styled && 'styled-components',
    options.memo && 'React.memo optimization',
    options.forwardRef && 'forwardRef support',
    options.exportType === 'named' && 'Named export',
    options.lazy && 'Lazy loading support'
  ].filter(Boolean).join('\n- ');

  return `Create a React component named ${name} in ${useTS ? 'TypeScript' : 'JavaScript'} with:\n- ${features}${options.aiFeatures ? `\nAdditional features: ${options.aiFeatures}` : ''
    }`;
}
