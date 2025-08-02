# AI Configuration System

## Overview

The React CLI now has a centralized AI configuration system that ensures AI features are only offered when properly configured and enabled globally.

## Key Features

### ✅ **Centralized AI Management**
- Global AI enable/disable through configuration
- Centralized provider selection (Gemini/Mistral) 
- Consistent AI validation across all commands

### ✅ **Proper Configuration Validation**
- Checks for required API keys
- Validates AI provider settings
- Prevents AI prompts when not properly configured

### ✅ **Manual AI Control**
- Dedicated AI configuration commands
- Easy switching between providers
- Clear status reporting

## Commands

### Enable AI Features
```bash
npm run re ai-config enable
```
- Enables AI globally
- Prompts for provider selection (Gemini/Mistral)
- Prompts for model selection
- Saves configuration to `react-cli.config.json`

### Disable AI Features
```bash
npm run re ai-config disable
```
- Disables AI globally
- No AI prompts will appear in any commands

### Check AI Status
```bash
npm run re ai-config status
```
- Shows current AI configuration
- Displays validation status
- Shows configuration issues and how to fix them

### Switch AI Provider
```bash
npm run re ai-config switch
```
- Switch between Gemini and Mistral
- Update model selection
- Maintains enabled status

## Configuration File

The AI settings are stored in `react-cli.config.json`:

```json
{
  "aiEnabled": true,
  "aiProvider": "gemini",
  "aiModel": "gemini-1.5-flash-latest"
}
```

## Environment Variables

### For Gemini AI
```bash
GEMINI_API_KEY=your_gemini_api_key
```

### For Mistral AI
```bash
MISTRAL_API_KEY=your_mistral_api_key
```

## How It Works

### 1. Global AI Check
All generators now check `shouldOfferAI(config, 'codeGeneration')` which:
- ✅ Verifies AI is enabled in configuration
- ✅ Validates required API keys are present
- ✅ Checks provider configuration is valid

### 2. Centralized AI Generation
All AI generation goes through `generateWithConfiguredAI()` which:
- ✅ Uses the configured provider (Gemini/Mistral)
- ✅ Uses the configured model
- ✅ Handles errors consistently

### 3. Generator Options
The `handleGeneratorOptions()` function now:
- ✅ Only offers AI when properly configured
- ✅ Respects global AI disable setting
- ✅ Shows clear messaging when AI is unavailable

## Migration Changes

### Before
```typescript
// AI was offered even if disabled or misconfigured
if (optionsConfig.aiSupported !== false) {
  result.useAI = await askBoolean(rl, 'Use AI to generate code?');
}
```

### After
```typescript
// AI only offered when properly configured
if (shouldOfferAI(config, 'codeGeneration') && optionsConfig.aiSupported !== false) {
  result.useAI = await askBoolean(rl, 'Use AI to generate code?');
}
```

## File Structure

```
src/
├── utils/
│   └── ai/
│       └── aiConfig.ts          # Centralized AI configuration
├── commands/
│   └── aiConfig.ts              # AI management commands
└── utils/shared/
    ├── generatorOptions.ts      # Updated to respect AI config
    └── generateWithAi.ts        # Uses centralized AI generation
```

## Benefits

### 🔒 **No More Broken AI Prompts**
- AI options only appear when properly configured
- Clear error messages when configuration is missing

### ⚡ **Consistent Experience**  
- Same AI behavior across all generators
- Unified provider switching
- Central configuration management

### 🛠️ **Easy Management**
- Simple enable/disable commands
- Clear status reporting
- Easy provider switching

### 🔍 **Better Debugging**
- Centralized validation
- Clear error messages
- Configuration issue detection

## Usage Examples

### First Time Setup
```bash
# Enable AI features
npm run re ai-config enable

# Check everything is working
npm run re ai-config status

# Generate a component with AI
npm run re generate component MyComponent --ai
```

### Switching Providers
```bash
# Switch from Gemini to Mistral
npm run re ai-config switch

# Verify the change
npm run re ai-config status
```

### Disabling AI Temporarily
```bash
# Disable AI for the project
npm run re ai-config disable

# All generate commands will now skip AI prompts
npm run re generate component MyComponent
```

## Troubleshooting

### AI Options Not Appearing
1. Check if AI is enabled: `npm run re ai-config status`
2. Verify API key is set in `.env` file
3. Ensure provider is properly configured

### Invalid Configuration
Run `npm run re ai-config status` to see specific issues and how to fix them.

### Provider Errors
Use `npm run re ai-config switch` to change to a different provider.
