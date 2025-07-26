# AI Integration Standardization Guide

## ✅ Generators Already Using New AI Pattern
- `generateComponent.ts` - ✅ Updated with proper AI integration
- `generateHoc.ts` - ✅ Already using new pattern  
- `generateHook.ts` - ✅ Already using new pattern
- `generateGuard.ts` - ✅ Already using new pattern
- `generateContext.ts` - ✅ Already using new pattern
- `generatePage.ts` (in page folder) - ✅ Updated with improved AI integration

## ✅ Generators Updated to New Pattern
- `generateService.ts` - ✅ Updated to use `createGeneratedFile` + `createServiceAIOptions`
- `generateUtil.ts` - ✅ Updated to use `createGeneratedFile` + `createAIOptions`

## 🔄 Generators That Need Update
The following generators should be updated to use the standardized AI pattern:

1. `generateType.ts` - Update to use `createTypeAIOptions`
2. `generateLayout.ts` - Update to use `createLayoutAIOptions`  
3. `generateRedux.ts` - Update to use `createReduxAIOptions`
4. `generateTestUtils.ts` - Update to use `createTestUtilsAIOptions`
5. Other generators that use old AI helper functions

## 📝 Standard Update Pattern

### Replace Old Imports:
```typescript
// OLD
import { generateXWithAI, confirmAIOutput } from '../../utils/generateAIHelper';

// NEW
import { createGeneratedFile } from '../../utils/file/createGeneratedFile';
import { createXAIOptions } from '../../utils/shared/generateWithAiHelper';
```

### Replace Old AI Logic:
```typescript
// OLD
let content = '';
if (options.useAI) {
  const aiContent = await generateXWithAI(name, config, options);
  if (aiContent && await confirmAIOutput(rl, aiContent)) {
    content = aiContent;
  }
}
if (!content) {
  content = defaultTemplate;
}
createFile(filePath, content, options.replace);

// NEW
const defaultContent = generateXContent(name, options, useTS);
await createGeneratedFile({
  rl,
  config,
  type: 'x',
  name: xName,
  targetDir,
  useTS,
  replace: options.replace ?? false,
  defaultContent,
  aiOptions: createXAIOptions(name, useTS)
});
```

## 🎯 Benefits of New Pattern
1. **Consistent AI Experience** - All generators ask "Generate X with AI? (y/n)"
2. **Single AI Prompt** - Only asks once per main file
3. **Automatic Fallback** - Falls back to templates if AI fails
4. **Unified Error Handling** - Consistent error messages across generators
5. **Standard File Creation** - Uses same file creation logic everywhere

## 🚀 Usage Examples
After updating, all generators work consistently:

```bash
# These all work the same way with AI
react-cli generate component MyComponent
react-cli generate service MyService  
react-cli generate hook useMyHook
react-cli generate context MyContext
react-cli generate hoc MyHoc

# All will ask: "Generate X with AI? (y/n)"
# All support the same options: --replace, --interactive, etc.
```
