# Performance Audit Feature

This feature provides comprehensive performance monitoring and auditing capabilities for React applications built with the React CLI.

## Features

### 🚀 Performance Auditing
- **Lighthouse Integration**: Automated performance audits using Google Lighthouse
- **Baseline Comparison**: Save and compare performance baselines over time
- **Threshold Monitoring**: Set performance thresholds with automated alerts
- **Detailed Metrics**: Track Core Web Vitals and other performance metrics

### 📊 Performance Monitoring
- **Custom Hooks**: Auto-generated performance monitoring hooks for components
- **Real-time Metrics**: Live performance metrics display during development
- **Interaction Tracking**: Monitor user interaction performance
- **Component Rendering**: Track component render times

### 🔧 Build Integration
- **Automated Scripts**: NPM scripts for performance auditing in CI/CD
- **Build-time Audits**: Performance audits after build completion
- **Performance Budgets**: Define and enforce performance budgets

## Usage

### Basic Performance Audit

```bash
# Audit a specific page
react-cli audit src/pages/HomePage

# Audit with custom URL
react-cli audit src/pages/HomePage --url http://localhost:3000/home

# Save as baseline
react-cli audit src/pages/HomePage --save-baseline

# Compare with baseline only
react-cli audit src/pages/HomePage --compare-only

# Set custom threshold
react-cli audit src/pages/HomePage --threshold 85
```

### Generate Pages with Performance Monitoring

```bash
# Create page with performance hook
react-cli g page Dashboard --perf-hook

# Create page with full performance monitoring
react-cli g page Dashboard --perf-hook --perf-monitoring

# Create page with build audit setup
react-cli g page Dashboard --perf-hook --perf-monitoring --audit-on-build

# Interactive mode with all options
react-cli g page Dashboard --interactive
```

### Using Performance Hooks

```tsx
import React, { useEffect } from 'react';
import { useDashboardPerformance } from '../hooks/useDashboardPerformance';

const Dashboard: React.FC = () => {
  const { startMeasure, endMeasure, getMetrics } = useDashboardPerformance();

  useEffect(() => {
    // Measure data loading
    startMeasure('data-load');
    
    fetchDashboardData().then(() => {
      endMeasure('data-load');
    });
  }, []);

  const handleUserAction = () => {
    startMeasure('user-action');
    
    // Perform action
    performAction().then(() => {
      endMeasure('user-action');
      
      // Get all metrics
      const metrics = getMetrics();
      console.log('Performance metrics:', metrics);
    });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleUserAction}>Action</button>
    </div>
  );
};
```

### Using Performance Wrapper

```tsx
import React from 'react';
import DashboardPerformanceWrapper from './components/DashboardPerformanceWrapper';

const Dashboard: React.FC = () => {
  return (
    <DashboardPerformanceWrapper showMetrics={process.env.NODE_ENV === 'development'}>
      <div>
        <h1>Dashboard</h1>
        {/* Your component content */}
      </div>
    </DashboardPerformanceWrapper>
  );
};
```

## NPM Scripts

After using `--audit-on-build`, these scripts are automatically added to your `package.json`:

```json
{
  "scripts": {
    "perf:audit": "Build and audit performance",
    "perf:baseline": "Save performance baseline",
    "perf:compare": "Compare with existing baseline"
  }
}
```

## Performance Metrics

The audit tracks these key metrics:

- **First Contentful Paint (FCP)**: Time to first content render
- **Largest Contentful Paint (LCP)**: Time to largest content render
- **First Input Delay (FID)**: Time to first user interaction
- **Cumulative Layout Shift (CLS)**: Visual stability score
- **Total Blocking Time (TBT)**: Main thread blocking time
- **Speed Index**: How quickly content is visually populated

## Optimization Suggestions

The audit provides actionable optimization suggestions:

### High Priority
- **Render-blocking Resources**: Code splitting recommendations
- **Largest Contentful Paint**: Image optimization strategies
- **Main Thread Blocking**: Web Workers and debouncing suggestions

### Medium Priority
- **Unused JavaScript**: Tree shaking and lazy loading tips
- **First Input Delay**: React optimization techniques
- **Cumulative Layout Shift**: Layout stability improvements

### Low Priority
- **Server Response Time**: API optimization suggestions

## Configuration

### Performance Thresholds

```json
{
  "perfThreshold": 90,
  "perfBaselineDir": "perf-baselines"
}
```

### Performance Budget

```json
{
  "budget": {
    "performance": {
      "score": 90,
      "metrics": {
        "first-contentful-paint": 2000,
        "largest-contentful-paint": 4000,
        "total-blocking-time": 300,
        "cumulative-layout-shift": 0.1
      }
    }
  }
}
```

## Dependencies

The performance audit feature requires these optional dependencies:

```bash
npm install --save-dev lighthouse chrome-launcher
```

The CLI will prompt you to install them if they're not available.

## Best Practices

1. **Regular Auditing**: Run audits after major changes
2. **Baseline Tracking**: Save baselines for important pages
3. **CI/CD Integration**: Include performance audits in your pipeline
4. **Development Monitoring**: Use performance wrappers during development
5. **Threshold Setting**: Set appropriate thresholds for your application
6. **Metric Focus**: Focus on Core Web Vitals for user experience

## Troubleshooting

### Common Issues

**Error: ECONNREFUSED**
- Ensure your development server is running
- Check the URL is correct
- Use `--url` to specify the correct URL

**Chrome Launch Failed**
- Install Google Chrome
- Check Chrome is in your PATH
- Use headless mode (automatically enabled)

**Performance Hook Not Working**
- Ensure you're in a browser environment
- Check console for performance API support
- Verify hook is properly imported

## Examples

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Performance Audit
  run: |
    npm run build
    npm run perf:audit
    npm run perf:compare
```

### Custom Audit Script

```bash
#!/bin/bash
# audit-all-pages.sh

pages=("HomePage" "Dashboard" "Profile" "Settings")

for page in "${pages[@]}"; do
  echo "Auditing $page..."
  react-cli audit "src/pages/$page" --save-baseline
done
```

This comprehensive performance audit feature helps you maintain optimal performance throughout your application's development lifecycle.
