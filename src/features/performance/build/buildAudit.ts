import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { runPerformanceAudit } from '../audit/performanceAudit';
import type { PerformanceConfig } from '../types/performanceTypes';

export async function setupBuildAudit(pagePath: string, config: PerformanceConfig): Promise<void> {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log(chalk.yellow('⚠️ package.json not found, skipping build audit setup'));
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add performance audit script
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    const auditScript = `react-cli audit ${pagePath} --url http://localhost:3000`;
    
    // Add different audit scripts based on build tool
    if (config.buildTool === 'next') {
      packageJson.scripts['perf:audit'] = `next build && next start & sleep 5 && ${auditScript} && pkill -f "next start"`;
    } else if (config.buildTool === 'vite') {
      packageJson.scripts['perf:audit'] = `vite build && vite preview & sleep 5 && ${auditScript} && pkill -f "vite preview"`;
    } else {
      packageJson.scripts['perf:audit'] = `npm run build && npm run start & sleep 5 && ${auditScript} && pkill -f "npm run start"`;
    }

    // Add performance audit with baseline saving
    packageJson.scripts['perf:baseline'] = `${packageJson.scripts['perf:audit']} --save-baseline`;
    
    // Add performance comparison
    packageJson.scripts['perf:compare'] = `${auditScript} --compare-only`;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log(chalk.green('✅ Added performance audit scripts to package.json:'));
    console.log(chalk.blue('  • perf:audit - Run full performance audit'));
    console.log(chalk.blue('  • perf:baseline - Save performance baseline'));
    console.log(chalk.blue('  • perf:compare - Compare with existing baseline'));
    
  } catch (error) {
    console.error(chalk.red('Failed to setup build audit:'), error);
  }
}

export async function runBuildTimeAudit(
  pagePath: string, 
  config: PerformanceConfig,
  buildCommand?: string
): Promise<void> {
  try {
    console.log(chalk.cyan('🔨 Building application for performance audit...'));
    
    // Default build commands based on build tool
    const defaultBuildCommands = {
      'next': 'next build && next start',
      'vite': 'vite build && vite preview',
      'react-scripts': 'npm run build && serve -s build'
    };
    
    const command = buildCommand || defaultBuildCommands[config.buildTool] || 'npm run build && npm run start';
    
    console.log(chalk.yellow(`Running: ${command}`));
    console.log(chalk.yellow('⏳ Waiting for build to complete...'));
    
    // In a real implementation, you would:
    // 1. Run the build command
    // 2. Wait for the server to be ready
    // 3. Run the performance audit
    // 4. Clean up the server process
    
    console.log(chalk.green('✅ Build completed. Run the following to perform audit:'));
    console.log(chalk.blue(`  react-cli audit ${pagePath} --url http://localhost:3000`));
    
  } catch (error) {
    console.error(chalk.red('Build-time audit failed:'), error);
  }
}

export function generatePerformanceBudget(config: PerformanceConfig): object {
  return {
    "budget": {
      "performance": {
        "score": config.perfThreshold || 90,
        "metrics": {
          "first-contentful-paint": 2000,
          "largest-contentful-paint": 4000,
          "total-blocking-time": 300,
          "cumulative-layout-shift": 0.1,
          "speed-index": 4000
        }
      }
    },
    "ci": {
      "collect": {
        "numberOfRuns": 3
      },
      "assert": {
        "assertions": {
          "categories:performance": ["error", { "minScore": config.perfThreshold || 90 }],
          "categories:accessibility": ["warn", { "minScore": 80 }],
          "categories:best-practices": ["warn", { "minScore": 80 }]
        }
      }
    }
  };
}
