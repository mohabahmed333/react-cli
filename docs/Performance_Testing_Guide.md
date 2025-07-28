# Performance Audit Feature Testing Guide

## Prerequisites

1. **Install Dependencies** (for full Lighthouse auditing):
```bash
npm install --save-dev lighthouse chrome-launcher
```

2. **Build the Project**:
```bash
npm run build
```

## Testing Methods

### 1. Basic CLI Command Testing

Test if the audit command is available:
```bash
node dist/cli.js --help
node dist/cli.js audit --help
```

### 2. Performance Hook Generation Testing

Test performance hook creation directly:
```bash
node -e "
const { createPerfHook } = require('./dist/features/performance/hooks/perfHook');
const config = { baseDir: 'src', typescript: true };
createPerfHook('TestComponent', true, config)
  .then(() => console.log('✅ Hook created successfully!'))
  .catch(console.error);
"
```

### 3. Performance Audit Testing

#### Without a Running Server (Fallback Mode):
```bash
# This will show the fallback behavior
node dist/cli.js audit test-page/TestPage.tsx
```

#### With a Running Development Server:
```bash
# Terminal 1: Start your development server
npm run dev
# or
npx vite dev

# Terminal 2: Run the audit
node dist/cli.js audit test-page/TestPage.tsx --url http://localhost:5173/test-page
```

#### Save and Compare Baselines:
```bash
# Save a baseline
node dist/cli.js audit test-page/TestPage.tsx --save-baseline --url http://localhost:5173

# Compare with baseline
node dist/cli.js audit test-page/TestPage.tsx --compare-only

# Set custom threshold
node dist/cli.js audit test-page/TestPage.tsx --threshold 85
```

### 4. Test Performance Monitoring Hook in Browser

Create a test React app to test the performance hook:

```tsx
// TestComponent.tsx
import React, { useEffect, useState } from 'react';
import { useTestPagePerformance } from './hooks/useTestPagePerformance';

const TestComponent: React.FC = () => {
  const { startMeasure, endMeasure, getMetrics } = useTestPagePerformance();
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    // Test measuring an async operation
    startMeasure('data-fetch');
    
    setTimeout(() => {
      endMeasure('data-fetch');
      setMetrics(getMetrics());
    }, 1000);
  }, []);

  const handleClick = () => {
    startMeasure('user-click');
    // Simulate some work
    setTimeout(() => {
      endMeasure('user-click');
      setMetrics(getMetrics());
    }, 100);
  };

  return (
    <div>
      <h1>Performance Test Component</h1>
      <button onClick={handleClick}>Test Performance</button>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Performance Metrics:</h3>
        {metrics.map((metric, index) => (
          <div key={index}>
            {metric.marker}: {metric.duration.toFixed(2)}ms
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestComponent;
```

### 5. Test Build Audit Integration

Test the build audit setup:
```bash
node -e "
const { setupBuildAudit } = require('./dist/features/performance/build/buildAudit');
const config = { buildTool: 'vite', baseDir: 'src' };
setupBuildAudit('test-page/TestPage', config)
  .then(() => console.log('✅ Build audit setup completed!'))
  .catch(console.error);
"
```

Then check if the scripts were added to package.json:
```bash
cat package.json | grep -A 3 "perf:"
```

### 6. Test Page Generation with Performance Features

Create a test page with performance monitoring:
```bash
# This would be the ideal test once the CLI issues are resolved
node dist/cli.js generate page TestPerfPage --perf-hook --perf-monitoring --audit-on-build
```

### 7. Integration Testing with Real App

1. **Create a simple React app**:
```bash
npm create vite@latest test-perf-app -- --template react-ts
cd test-perf-app
npm install
```

2. **Copy the performance files**:
```bash
cp -r ../src/hooks ./src/
cp -r ../src/features ./src/
```

3. **Use the performance hook**:
```tsx
import { useTestPagePerformance } from './hooks/useTestPagePerformance';
```

4. **Run development server and audit**:
```bash
npm run dev
# In another terminal
node ../dist/cli.js audit src/App.tsx --url http://localhost:5173
```

## Expected Results

### ✅ Successful Tests Should Show:

1. **Hook Creation**: Files created in `src/hooks/`
2. **Audit Command**: Proper CLI help and options
3. **Performance Metrics**: Console logs with timing information
4. **Lighthouse Integration**: Performance scores and suggestions (with dependencies)
5. **Build Scripts**: NPM scripts added to package.json

### 🚨 Common Issues and Solutions:

1. **"lighthouse not found"**: Install `npm install --save-dev lighthouse chrome-launcher`
2. **"ECONNREFUSED"**: Make sure development server is running
3. **"Screen emulation error"**: This is a known Lighthouse configuration issue, will fallback gracefully
4. **"Command not found"**: Make sure to run `npm run build` first

## Manual Testing Checklist

- [ ] CLI command registration works
- [ ] Performance hook generation creates files
- [ ] Performance metrics are logged in browser console
- [ ] Audit command runs without crashing
- [ ] Build audit setup modifies package.json
- [ ] Interactive performance monitoring displays metrics
- [ ] Baseline saving/loading works
- [ ] Optimization suggestions are shown

## Automated Testing Script

Create a comprehensive test script:

```bash
#!/bin/bash
# test-performance-features.sh

echo "🧪 Testing Performance Audit Feature"

# Build project
echo "📦 Building project..."
npm run build

# Test CLI registration
echo "🔧 Testing CLI registration..."
node dist/cli.js audit --help

# Test hook creation
echo "🪝 Testing hook creation..."
node -e "
const { createPerfHook } = require('./dist/features/performance/hooks/perfHook');
createPerfHook('TestHook', true, { baseDir: 'test-output', typescript: true });
"

# Test build audit setup
echo "🏗️ Testing build audit setup..."
node -e "
const { setupBuildAudit } = require('./dist/features/performance/build/buildAudit');
setupBuildAudit('test-page', { buildTool: 'vite' });
"

echo "✅ All tests completed!"
```

This comprehensive testing approach ensures all aspects of the performance audit feature work correctly.
