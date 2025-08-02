# Mistral AI Integration Guide

This guide explains how to integrate and use Mistral AI alongside Google Gemini in your React CLI tool.

## Overview

The React CLI now supports **dual AI providers**:
- **Google Gemini** (default) - Free tier available, good for general development
- **Mistral AI** (new) - Advanced reasoning, excellent for complex code generation

## Installation & Setup

### Step 1: Install Mistral AI Package

```bash
# Using npm
npm install @mistralai/mistralai

# Using yarn
yarn add @mistralai/mistralai

# Using pnpm
pnpm add @mistralai/mistralai

# Or use the built-in add command
yarn re add @mistralai/mistralai
```

### Step 2: Get Mistral API Key

1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Sign up or log in
3. Create a new API key
4. Copy the key for the next step

### Step 3: Configure Environment

Add your Mistral API key to your `.env` file:

```env
# Mistral AI Configuration
MISTRAL_API_KEY=your_actual_api_key_here

# You can keep both providers configured
GEMINI_API_KEY=your_gemini_key_here
```

### Step 4: Enable Mistral AI

```bash
# Enable Mistral as your AI provider
yarn re ai enable --provider mistral

# Or switch from Gemini to Mistral
yarn re ai switch mistral

# Check your current AI configuration
yarn re mistral status
```

## Available Commands

### Basic AI Commands (Works with Both Providers)

```bash
# Generate code with current AI provider
yarn re ai generate "create a React hook for data fetching"

# Enhance existing code
yarn re ai enhance src/components/MyComponent.tsx

# Generate documentation
yarn re ai docs src/utils/helpers.ts

# Switch between providers
yarn re ai switch mistral
yarn re ai switch gemini
```

### Mistral-Specific Commands

```bash
# Create resources with Mistral AI
yarn re mistral create component UserCard --functionality "display user profile with avatar"
yarn re mistral create hook DataFetcher --functionality "fetch and cache API data with error handling"
yarn re mistral create util formatCurrency --functionality "format numbers as currency with locale support"
yarn re mistral create type User --functionality "user profile with roles and permissions"
yarn re mistral create page Dashboard --css --components --test

# Interactive resource creation
yarn re mistral interactive

# Show examples
yarn re mistral examples

# Check Mistral configuration
yarn re mistral status
```

## Resource Creation with Mistral AI

### Creating Components

```bash
yarn re mistral create component ProductCard \
  --functionality "display product with price, image, and add to cart button" \
  --css --test
```

This generates:
- `src/components/ProductCard.tsx` - Main component
- `src/components/ProductCard.module.css` - CSS modules (if --css)
- `src/components/ProductCard.test.tsx` - Tests (if --test)

### Creating Custom Hooks

```bash
yarn re mistral create hook ApiData \
  --functionality "fetch data with loading states, error handling, and caching"
```

Generates: `src/hooks/useApiData.ts`

### Creating Utilities

```bash
yarn re mistral create util ValidationHelpers \
  --functionality "validate email, phone, and password with detailed error messages"
```

Generates: `src/utils/ValidationHelpers.ts`

### Creating TypeScript Types

```bash
yarn re mistral create type ApiResponse \
  --functionality "generic API response with data, error, and metadata"
```

Generates: `src/types/ApiResponse.ts`

### Creating Pages

```bash
yarn re mistral create page UserProfile \
  --functionality "user profile page with edit capabilities" \
  --css --components
```

Generates:
- `src/pages/UserProfile.tsx`
- `src/pages/UserProfile.module.css` (if --css)
- `src/pages/components/` folder (if --components)

### Creating Services

```bash
yarn re mistral create service UserAPI \
  --functionality "handle user CRUD operations with authentication"
```

Generates: `src/services/UserAPIService.ts`

## Programmatic Usage

You can also use the Mistral AI integration programmatically:

```typescript
import { createResource } from './utils/mistralResourceCreator';
import { generateCode } from './services/mistral-service';

// Create resources programmatically
await createResource('hook', 'DataFetcher', config, {
  functionality: 'fetch and cache API data',
  test: true
});

// Generate code directly
const code = await generateCode(
  'Create a React component for displaying a user avatar',
  {
    projectType: 'react',
    typescript: true,
    localization: false
  }
);
```

## Configuration Options

### AI Provider Settings

```json
{
  "aiEnabled": true,
  "aiProvider": "mistral",
  "aiModel": "mistral-large-latest"
}
```

### Available Mistral Models

- `mistral-large-latest` - Most capable, best for complex tasks
- `mistral-medium-latest` - Balanced performance and cost
- `mistral-small-latest` - Fastest, good for simple tasks

### Switching Models

```bash
# During initial setup
yarn re ai enable --provider mistral

# Then manually edit create.config.json to change model:
{
  "aiModel": "mistral-medium-latest"
}
```

## Interactive Mode

For a guided experience, use interactive mode:

```bash
yarn re mistral interactive
```

This will walk you through:
1. Choosing resource type
2. Naming your resource
3. Describing functionality
4. Selecting options (CSS, tests, etc.)
5. Generating the code

## Examples

### Hook Example

```bash
yarn re mistral create hook LocalStorage \
  --functionality "manage localStorage with JSON serialization and type safety"
```

Generates a hook like:
```typescript
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // Generated implementation with proper TypeScript types
  // Error handling, JSON serialization, etc.
};
```

### Component Example

```bash
yarn re mistral create component DataTable \
  --functionality "sortable table with pagination and filtering" \
  --css --test
```

Generates:
- Fully typed React component
- CSS modules for styling
- Comprehensive test suite
- JSDoc documentation

## Best Practices

### 1. Be Descriptive with Functionality

❌ Bad:
```bash
yarn re mistral create hook Data
```

✅ Good:
```bash
yarn re mistral create hook ApiData \
  --functionality "fetch paginated user data with search, filtering, and infinite scroll"
```

### 2. Use Appropriate Options

For pages that need styling and sub-components:
```bash
yarn re mistral create page Dashboard \
  --functionality "admin dashboard with charts and user management" \
  --css --components --test
```

### 3. Generate Tests

Always include tests for critical components:
```bash
yarn re mistral create service PaymentProcessor \
  --functionality "handle Stripe payments with error recovery" \
  --test
```

## Troubleshooting

### API Key Issues

```bash
# Check if key is set
yarn re mistral status

# If missing, add to .env:
MISTRAL_API_KEY=your_key_here
```

### Package Not Found

```bash
# Install the package
yarn re add @mistralai/mistralai

# Or manually:
npm install @mistralai/mistralai
```

### Provider Not Set

```bash
# Switch to Mistral
yarn re ai switch mistral

# Or enable from scratch
yarn re ai enable --provider mistral
```

### Generation Fails

1. Check your API key validity
2. Verify internet connection
3. Try a different model:
   ```bash
   # Edit create.config.json
   "aiModel": "mistral-medium-latest"
   ```

## Comparison: Mistral vs Gemini

| Feature | Mistral AI | Google Gemini |
|---------|------------|---------------|
| **Code Quality** | Excellent for complex logic | Good for general tasks |
| **TypeScript** | Excellent type inference | Good type support |
| **Documentation** | Detailed JSDoc comments | Basic documentation |
| **Cost** | Pay-per-use | Free tier available |
| **Speed** | Fast (especially small model) | Very fast |
| **Context** | Large context window | Good context handling |

### When to Use Mistral

- Complex business logic
- Advanced TypeScript patterns
- Production-ready code
- Detailed documentation needed

### When to Use Gemini

- Rapid prototyping
- Simple components
- Learning/experimentation
- Free tier projects

## Advanced Usage

### Custom Prompt Templates

You can extend the resource creator with custom prompts:

```typescript
const customPrompts = {
  apiClient: (name: string, options: ResourceOptions) => 
    `Create an API client for ${name} that handles authentication, retries, and error mapping...`
};
```

### Batch Resource Creation

```bash
# Create multiple related resources
yarn re mistral create type User --functionality "user with profile and settings"
yarn re mistral create service UserAPI --functionality "CRUD operations for users"
yarn re mistral create hook UserData --functionality "manage user state and API calls"
```

### Integration with CI/CD

Add AI-generated code validation to your pipeline:

```yaml
- name: Validate AI Generated Code
  run: |
    yarn re ai docs src/generated/
    yarn test src/generated/
```

## Contributing

To extend Mistral AI integration:

1. Add new resource types in `mistralResourceCreator.ts`
2. Update prompt templates
3. Add new command options
4. Update documentation

## Support

For issues with Mistral AI integration:

1. Check the [troubleshooting section](#troubleshooting)
2. Verify your API key at [Mistral Console](https://console.mistral.ai/)
3. Open an issue with your configuration details

---

**Happy coding with Mistral AI! 🤖✨**
