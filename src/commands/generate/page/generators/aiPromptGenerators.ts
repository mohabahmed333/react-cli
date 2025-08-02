import { PageOptions } from '../core/pageTypes';

/**
 * Generate AI prompt for page creation
 */
export function generateAIPrompt(name: string, options: PageOptions, useTS: boolean): string {
  const features = [
    options.css && 'CSS modules with responsive design',
    options.components && 'reusable child components',
    options.lib && 'constants and configuration utilities',
    options.hooks && 'custom React hooks for state management',
    options.utils && 'utility functions for data processing',
    options.types && 'TypeScript type definitions',
    options.layout && 'layout wrapper component',
    options.perfHook && 'performance monitoring capabilities',
    options.perfMonitoring && 'performance metrics display'
  ].filter(Boolean).join(', ');

  const additionalContext = [
    `The page should be a React ${useTS ? 'TypeScript' : 'JavaScript'} functional component`,
    options.hooks && `Import and use custom hooks from './hooks/use${name}'`,
    options.utils && `Import utility functions from './utils/${name}Utils'`,
    options.types && useTS && `Import types from './types/${name}.types'`,
    options.css && `Use CSS modules with className from './${name}.module.css'`,
    options.lib && `Import constants from './lib/constants'`,
    'Follow React best practices and include proper error handling',
    'Use semantic HTML and accessibility features',
    'Include JSDoc comments for all functions and interfaces'
  ].filter(Boolean).join('\n- ');

  return `Create a comprehensive ${name} page component with the following features: ${features}.

Requirements:
- ${additionalContext}
- Make the component modular and maintainable
- Ensure proper separation of concerns between files
- Include loading states, error handling, and user feedback
- Follow modern React patterns (hooks, functional components)
- Optimize for performance and accessibility

Generate ONLY the main page component code. The supporting files (hooks, utils, types, etc.) will be generated separately with their own AI prompts.`;
}

/**
 * Generate AI prompt for hooks
 */
export function generateHookAIPrompt(name: string, useTS: boolean): string {
  return `Create a custom React hook named use${name} for data fetching and state management.

Requirements:
- ${useTS ? 'TypeScript' : 'JavaScript'} with proper typing
- Include loading, error, and data states
- Implement useCallback and useEffect properly
- Add a refetch function for manual data refresh
- Handle error cases gracefully
- Use modern React patterns
- Include proper cleanup and optimization

The hook should return: { data, loading, error, refetch }`;
}

/**
 * Generate AI prompt for utilities
 */
export function generateUtilsAIPrompt(name: string, useTS: boolean): string {
  return `Create utility functions for the ${name} page.

Requirements:
- ${useTS ? 'TypeScript' : 'JavaScript'} with proper typing
- Data formatting and validation functions
- URL parameter parsing utilities
- Debounce function for search/input
- ID generation utility
- Input validation functions
- Export as named functions in an object
- Include JSDoc comments
- Follow functional programming principles`;
}

/**
 * Generate AI prompt for types
 */
export function generateTypesAIPrompt(name: string): string {
  return `Create comprehensive TypeScript type definitions for the ${name} page.

Requirements:
- Component props interface
- Data model interfaces
- State management types
- API response types
- Form data types
- Action types for reducers
- Export all types as named exports
- Include proper JSDoc comments
- Follow TypeScript best practices
- Make types reusable and composable`;
}
