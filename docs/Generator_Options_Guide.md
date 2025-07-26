# Generator Options Utility

This utility provides reusable functions for handling interactive options across all generators in the React CLI.

## Overview

The `generatorOptions.ts` utility provides:
- **Reusable prompt functions** for consistent UX across generators
- **Pre-configured option sets** for common generator types
- **Conditional option support** based on TypeScript/project settings
- **Multi-select and single-choice prompts**

## Core Functions

### `handleGeneratorOptions()`
Main function that handles all interactive options for a generator.

```typescript
const result = await handleGeneratorOptions(rl, config, useTS, optionsConfig);
```

### Prompt Functions
- `askChoice()` - Single choice from numbered options
- `askMultiSelect()` - Multiple choices with comma separation
- `askBoolean()` - Yes/No questions

## Usage Examples

### Page Generator
```typescript
import { handleGeneratorOptions, PAGE_OPTIONS_CONFIG } from '../../../utils/shared/generatorOptions';

// In interactive mode
const result = await handleGeneratorOptions(rl, config, useTS, PAGE_OPTIONS_CONFIG);

// Apply results
options.useAI = result.useAI;
options.aiFeatures = result.aiFeatures;
options.css = result.additionalFiles.css;
options.test = result.additionalFiles.test;
// ... etc
```

### Component Generator
```typescript
import { handleGeneratorOptions, COMPONENT_OPTIONS_CONFIG } from '../../../utils/shared/generatorOptions';

// In interactive mode
const result = await handleGeneratorOptions(rl, config, useTS, COMPONENT_OPTIONS_CONFIG);

// Apply results
options.useAI = result.useAI;
options.css = result.styling === 'css';
options.styled = result.styling === 'styled';
options.test = result.additionalFiles.test;
```

### Custom Generator Configuration
```typescript
const CUSTOM_OPTIONS_CONFIG: GeneratorOptionsConfig = {
  supportedFiles: {
    test: true,
    types: true,
    utils: true
  },
  aiSupported: true,
  stylingOptions: [
    { value: 'none', label: 'No styling' },
    { value: 'custom', label: 'Custom styles' }
  ]
};

const result = await handleGeneratorOptions(rl, config, useTS, CUSTOM_OPTIONS_CONFIG);
```

## Pre-configured Option Sets

### `PAGE_OPTIONS_CONFIG`
For page generators:
- CSS modules, test files, components folder
- Lib utilities, hooks, utils, types, layout
- AI generation support

### `COMPONENT_OPTIONS_CONFIG`
For component generators:
- Test files, Storybook stories, styled components
- Props interfaces, index files
- Multiple styling options (CSS, Styled Components, Emotion)

### `SERVICE_OPTIONS_CONFIG`
For service generators:
- Test files, TypeScript types, utilities
- AI generation support

### `HOOK_OPTIONS_CONFIG`
For hook generators:
- Test files, TypeScript types
- AI generation support

## Benefits

1. **Consistency**: All generators use the same prompt style and UX
2. **Maintainability**: Changes to prompt logic only need to be made in one place
3. **Extensibility**: Easy to add new generators with consistent options
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Conditional Logic**: Options automatically appear/disappear based on context

## User Experience

Instead of typing `y`/`n` for each option, users get:

```
Use AI to generate code?
1. Yes
2. No
Select option (1-2): 

Choose styling option:
1. No styling
2. CSS Module
3. Styled Components
4. Emotion
Select option (1-4): 

Include additional files? (separate multiple choices with commas)
1. Test file
2. Storybook story
3. Props interface
4. Index file
Select options (e.g., 1,3,4): 1,2,4
```

This is much more user-friendly than individual yes/no questions!

## Migration Guide

To migrate an existing generator:

1. Import the utilities:
```typescript
import { handleGeneratorOptions, SERVICE_OPTIONS_CONFIG } from '../../../utils/shared/generatorOptions';
```

2. Replace interactive logic:
```typescript
// Old way
if (options.interactive) {
  const useAI = await askQuestion(rl, 'Use AI? (y/n): ');
  options.useAI = useAI.toLowerCase() === 'y';
  // ... more questions
}

// New way
if (options.interactive) {
  const result = await handleGeneratorOptions(rl, config, useTS, SERVICE_OPTIONS_CONFIG);
  options.useAI = result.useAI;
  options.aiFeatures = result.aiFeatures;
  // Apply other options...
}
```

3. Apply the results to your options object based on what your generator supports.

## Future Enhancements

- Add validation for prompt responses
- Add help text for each option
- Add option to save/load presets
- Add option dependencies (e.g., if CSS is selected, offer SCSS option)
