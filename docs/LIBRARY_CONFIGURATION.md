# React CLI - Library Configuration

This file controls which features are available in the CLI library itself.
This is separate from user project configurations.

## AI Features Configuration

To **ENABLE** AI features for all users:
1. Open `src/config/libraryConfig.ts`
2. Set `AI_FEATURES_ENABLED: true`
3. Enable specific features you want to support
4. Rebuild the CLI

To **DISABLE** AI features completely:
1. Open `src/config/libraryConfig.ts` 
2. Set `AI_FEATURES_ENABLED: false`
3. Rebuild the CLI

## Current Configuration

```typescript
export const LIBRARY_AI_CONFIG = {
  // Master switch - set to false to disable all AI features
  AI_FEATURES_ENABLED: false,
  
  // Individual feature toggles
  FEATURES: {
    CODE_GENERATION: false,    // AI code generation in generators
    DOCUMENTATION: false,      // AI documentation generation
    REFACTORING: false,        // AI code refactoring
    TESTING: false            // AI test generation
  }
};
```

## Effects of Disabling AI

When `AI_FEATURES_ENABLED: false`:
- ❌ No AI commands appear in CLI help
- ❌ No AI options in interactive generators
- ❌ `ai-config` commands are not available
- ❌ All AI-related prompts are hidden
- ✅ CLI works normally for all other features

## Effects of Enabling AI

When `AI_FEATURES_ENABLED: true`:
- ✅ AI commands appear in CLI help
- ✅ AI options appear in interactive generators
- ✅ `ai-config` commands are available
- ✅ Users can enable/disable AI per project
- ✅ Users can choose their preferred AI provider

## Build Process

After changing the configuration:

```bash
# Rebuild the CLI
npm run build

# Test locally
npm link
cd /path/to/test/project
npm link react-cli

# Or publish to npm
npm publish
```

## Distribution Strategy

You can have different builds:

1. **Community Edition**: `AI_FEATURES_ENABLED: false`
2. **Pro Edition**: `AI_FEATURES_ENABLED: true`
3. **Custom Enterprise**: Selected features enabled

This gives you complete control over which features are available to different user segments.
