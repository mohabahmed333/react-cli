import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { createFolder } from '../../../utils/file';
import { suggestOptimizations } from '../optimization/suggestions';
import type { 
  PerformanceAuditOptions, 
  PerformanceConfig, 
  PerformanceBaseline, 
  PerformanceResult 
} from '../types/performanceTypes';

export async function runPerformanceAudit(
  pagePath: string, 
  options: PerformanceAuditOptions, 
  config: PerformanceConfig
): Promise<void> {
  try {
    console.log(chalk.cyan(`\n🚀 Starting performance audit for: ${pagePath}`));

    // Dynamic imports for optional dependencies
    const lighthouse = await importLighthouse();
    const chromeLauncher = await importChromeLauncher();
    
    if (!lighthouse || !chromeLauncher) {
      console.log(chalk.yellow('⚠️ Lighthouse dependencies not found. Installing...'));
      await installLighthouseDependencies();
      return;
    }

    const { writeFile, readFile, access } = fs.promises;

    // Get URL for auditing
    const url = options.url || getDefaultUrl(pagePath, config);
    
    console.log(chalk.cyan(`🔍 Auditing URL: ${url}`));
    
    // Check if we should only compare with baseline
    if (options.compareOnly) {
      await compareWithBaseline(pagePath, config);
      return;
    }

    // Launch Chrome
    const chrome = await chromeLauncher.launch({ 
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] 
    });
    
    try {
      const opts = {
        port: chrome.port,
        output: 'json' as const,
        onlyCategories: ['performance'],
        formFactor: 'desktop' as const
      };

      // Run Lighthouse
      console.log(chalk.yellow('⏳ Running Lighthouse audit...'));
      const runnerResult = await lighthouse.default(url, opts);
      
      if (!runnerResult || !runnerResult.lhr) {
        throw new Error('Failed to get Lighthouse results');
      }

      const report = runnerResult.report;
      const lhr = runnerResult.lhr;
      const perfScore = (lhr.categories.performance.score || 0) * 100;

      // Extract key metrics
      const metrics = extractMetrics(lhr);
      const result: PerformanceResult = {
        score: perfScore,
        metrics,
        audits: lhr.audits
      };

      // Save baseline if requested
      const baselinePath = getBaselinePath(pagePath, config);
      if (options.saveBaseline) {
        const reportString = Array.isArray(report) ? report[0] : report;
        await saveBaseline(baselinePath, url, result, reportString);
        console.log(chalk.green(`✅ Saved performance baseline: ${baselinePath}`));
      }

      // Compare with baseline if exists
      await compareWithExistingBaseline(baselinePath, result, options);

      // Check against threshold
      const threshold = parseInt(options.threshold || '90', 10);
      if (perfScore < threshold) {
        console.log(chalk.red(`\n❌ Performance score ${perfScore.toFixed(1)}% is below threshold ${threshold}%`));
        await suggestOptimizations(lhr.audits);
      } else {
        console.log(chalk.green(`\n✅ Performance score ${perfScore.toFixed(1)}% meets threshold ${threshold}%`));
      }

      // Display metrics summary
      displayMetricsSummary(result);

    } finally {
      await chrome.kill();
    }

  } catch (error) {
    console.error(chalk.red('Performance audit failed:'), error instanceof Error ? error.message : 'Unknown error');
    
    // Provide helpful suggestions for common errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log(chalk.yellow('\n💡 Tips:'));
        console.log(chalk.yellow('• Make sure your development server is running'));
        console.log(chalk.yellow('• Check if the URL is correct'));
        console.log(chalk.yellow('• Try specifying --url with the correct URL'));
      }
    }
  }
}

async function importLighthouse() {
  try {
    return await import('lighthouse');
  } catch {
    return null;
  }
}

async function importChromeLauncher() {
  try {
    return await import('chrome-launcher');
  } catch {
    return null;
  }
}

async function installLighthouseDependencies(): Promise<void> {
  console.log(chalk.yellow('Installing Lighthouse dependencies...'));
  console.log(chalk.blue('Run: npm install --save-dev lighthouse chrome-launcher'));
  console.log(chalk.blue('Or: yarn add --dev lighthouse chrome-launcher'));
}

function getDefaultUrl(pagePath: string, config: PerformanceConfig): string {
  const cleanPath = pagePath.replace(/^src\/pages\//, '').replace(/\.(tsx?|jsx?)$/, '');
  const port = config.port || 3000;
  return `http://localhost:${port}/${cleanPath}`;
}

function getBaselinePath(pagePath: string, config: PerformanceConfig): string {
  const baselineDir = config.perfBaselineDir || 'perf-baselines';
  const fileName = pagePath.replace(/[\/\\]/g, '-').replace(/\.(tsx?|jsx?)$/, '') + '.json';
  return path.join(process.cwd(), baselineDir, fileName);
}

async function saveBaseline(
  baselinePath: string, 
  url: string, 
  result: PerformanceResult, 
  report: string
): Promise<void> {
  createFolder(path.dirname(baselinePath));
  
  const baseline: PerformanceBaseline = {
    url,
    timestamp: new Date().toISOString(),
    score: result.score,
    metrics: result.metrics,
    audits: result.audits
  };
  
  await fs.promises.writeFile(baselinePath, JSON.stringify(baseline, null, 2));
}

async function compareWithBaseline(pagePath: string, config: PerformanceConfig): Promise<void> {
  const baselinePath = getBaselinePath(pagePath, config);
  
  try {
    await fs.promises.access(baselinePath);
    const baseline = JSON.parse(await fs.promises.readFile(baselinePath, 'utf8'));
    
    console.log(chalk.cyan(`\n📊 Baseline Performance Data for ${pagePath}:`));
    console.log(chalk.yellow(`Score: ${baseline.score.toFixed(1)}%`));
    console.log(chalk.yellow(`Created: ${new Date(baseline.timestamp).toLocaleString()}`));
    console.log(chalk.yellow(`URL: ${baseline.url}`));
    
    displayMetricsSummary(baseline);
    
  } catch {
    console.log(chalk.red(`❌ No baseline found for ${pagePath}`));
    console.log(chalk.blue('💡 Run with --save-baseline to create one'));
  }
}

async function compareWithExistingBaseline(
  baselinePath: string, 
  result: PerformanceResult, 
  options: PerformanceAuditOptions
): Promise<void> {
  try {
    await fs.promises.access(baselinePath);
    const baseline: PerformanceBaseline = JSON.parse(await fs.promises.readFile(baselinePath, 'utf8'));
    
    const diff = result.score - baseline.score;
    const diffStatus = diff >= 0 
      ? chalk.green(`+${diff.toFixed(1)}%`) 
      : chalk.red(`${diff.toFixed(1)}%`);
    
    console.log(chalk.yellow(`\n📊 Performance Score: ${result.score.toFixed(1)}% (Baseline: ${baseline.score.toFixed(1)}%)`));
    console.log(chalk.blue(`🔄 Change from baseline: ${diffStatus}`));
    
    if (diff < -5) {
      console.log(chalk.red('\n⚠️ Significant performance regression detected!'));
    } else if (diff > 5) {
      console.log(chalk.green('\n🎉 Significant performance improvement!'));
    }
    
  } catch {
    console.log(chalk.yellow(`\n📊 Performance Score: ${result.score.toFixed(1)}%`));
    console.log(chalk.blue('ℹ️ No baseline found for comparison'));
  }
}

function extractMetrics(lhr: any) {
  const audits = lhr.audits;
  return {
    firstContentfulPaint: audits['first-contentful-paint']?.numericValue || 0,
    largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || 0,
    firstInputDelay: audits['max-potential-fid']?.numericValue || 0,
    cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || 0,
    totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
  };
}

function displayMetricsSummary(result: PerformanceResult): void {
  console.log(chalk.cyan('\n📈 Key Metrics:'));
  console.log(chalk.white(`• First Contentful Paint: ${(result.metrics.firstContentfulPaint / 1000).toFixed(2)}s`));
  console.log(chalk.white(`• Largest Contentful Paint: ${(result.metrics.largestContentfulPaint / 1000).toFixed(2)}s`));
  console.log(chalk.white(`• Total Blocking Time: ${result.metrics.totalBlockingTime.toFixed(0)}ms`));
  console.log(chalk.white(`• Cumulative Layout Shift: ${result.metrics.cumulativeLayoutShift.toFixed(3)}`));
}
