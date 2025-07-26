# Content Generators Directory

This directory contains all content generation functions separated from the main generator logic for better organization and maintainability.

## Structure

```
src/commands/content/
├── index.ts           # Central export hub for all content generators
├── component.ts       # React component content generation
├── page.ts           # React page content generation
├── test.ts           # Test file content generation
├── hook.ts           # React hook content generation
├── hoc.ts            # Higher-Order Component content generation
├── service.ts        # Service class content generation
├── utils.ts          # Utility function content generation
├── types.ts          # TypeScript types content generation
├── lib.ts            # Library/constants content generation
├── layout.ts         # Layout component content generation
└── styles.ts         # CSS/Styled components content generation
```

## Purpose

This separation provides several benefits:

1. **Single Responsibility**: Each file handles content generation for a specific type
2. **Reusability**: Content generators can be used across multiple generator commands
3. **Maintainability**: Changes to content templates are centralized
4. **Testing**: Content generation logic can be unit tested independently
5. **Organization**: Clear separation between generation logic and content templates

## Usage

All content generators are exported from the main index file:

```typescript
import { 
  generateComponentContent,
  generatePageContent,
  generateServiceContent,
  generateHocContent
} from '../content';
```

## Content Generator Functions

### Component Content (`component.ts`)
- `generateComponentContent(name, options, useTS)` - Main React component

### Page Content (`page.ts`)
- `generatePageContent(name, options, useTS)` - Main page component
- `generatePageTestContent(name, useTS)` - Page-specific test file

### Service Content (`service.ts`)
- `generateServiceContent(name, options, useTS)` - API service class with CRUD operations

### HOC Content (`hoc.ts`)
- `generateHocContent(name, useTS)` - Higher-Order Component wrapper

### Hook Content (`hook.ts`)
- `generateHookContent(name, useTS)` - Custom React hook

### Test Content (`test.ts`)
- `generateTestContent(name, useTS, exportType)` - Generic test file template

### Utility Content (`utils.ts`)
- `generateUtilsContent(name, useTS)` - Utility function template

### Types Content (`types.ts`)
- `generateTypesContent(name)` - TypeScript interface and type definitions

### Library Content (`lib.ts`)
- `generateLibContent(name, useTS)` - Constants and library utilities

### Layout Content (`layout.ts`)
- `generateLayoutContent(useTS)` - Layout component for Next.js

### Styles Content (`styles.ts`)
- `generateCSSContent(name)` - CSS module styles
- `generateStyledComponentsContent(name)` - Styled-components template

## Integration with Generators

Each generator now imports only the content functions it needs:

```typescript
// In generateComponent.ts
import { generateComponentContent, generateTestContent } from '../../content';

// In generatePage.ts
import { 
  generatePageContent, 
  generateHookContent, 
  generateUtilsContent 
} from '../../content';

// In generateService.ts
import { generateServiceContent } from '../../content';
```

## Migration Benefits

**Before Separation:**
- Content generation logic mixed with generator logic
- Duplicate content templates across generators
- Hard to maintain and test content generation
- Large generator files with mixed responsibilities

**After Separation:**
- Clean separation of concerns
- Reusable content templates
- Easy to test and maintain
- Smaller, focused generator files
- Centralized content management

## Future Enhancements

1. **Template System**: Add support for custom templates
2. **Content Validation**: Validate generated content syntax
3. **Content Testing**: Unit tests for each content generator
4. **Template Inheritance**: Base templates with variations
5. **Dynamic Content**: Runtime template customization

## Adding New Content Generators

To add a new content generator:

1. Create a new file in `src/commands/content/`
2. Export content generation functions
3. Add exports to `index.ts`
4. Import in relevant generators
5. Update this documentation

Example:
```typescript
// src/commands/content/context.ts
export function generateContextContent(name: string, useTS: boolean): string {
  return useTS 
    ? `// TypeScript context template`
    : `// JavaScript context template`;
}

// src/commands/content/index.ts
export { generateContextContent } from './context';

// src/commands/generate/generateContext.ts
import { generateContextContent } from '../content';
```

This structure ensures scalability and maintainability as the CLI tool grows!
