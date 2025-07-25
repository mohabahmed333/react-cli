import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration, CLIConfig } from '../utils/config';
import { createFile, createFolder } from '../utils/file';
import { Interface as ReadlineInterface } from 'readline';

interface BundleCheckOptions {
  watch?: boolean;
  budget?: string;
  htmlReport?: boolean;
}

interface BundleDependency {
  name: string;
  size: number;
}

interface BundleAnalysisResults {
  totalSize: number;
  files: string[];
  largestDependencies: BundleDependency[];
  warnings: string[];
}

export function handleBundleCheck(program: Command, rl: ReadlineInterface) {
  program
    .command('bundle-check')
    .description('Analyze application bundle size and dependencies')
    .option('--watch', 'Monitor bundle size in real-time')
    .option('--budget <kb>', 'Set size budget in KB (default: 500)', '500')
    .option('--html-report', 'Generate HTML report')
    .action(async (options: BundleCheckOptions) => {
      const config = await setupConfiguration(rl);
      await performBundleAnalysis(config, options);
    });
}

async function performBundleAnalysis(config: CLIConfig, options: BundleCheckOptions) {
  console.log(chalk.cyan.bold('\n📦 Starting bundle analysis...'));
  try {
    const { execSync } = require('child_process');
    const projectType = config.projectType;
    const sizeBudgetKB = parseInt(options.budget || '500', 10);
    // Step 1: Build the project
    console.log(chalk.blue('Building project for analysis...'));
    const buildCommand = projectType === 'next'
      ? 'next build'
      : 'scripts build';
    execSync(buildCommand, { stdio: 'inherit' });
    // Step 2: Analyze bundle
    const bundleDir = projectType === 'next' ? '.next' : 'build';
    const analyzeCommand = `npx source-map-explorer ${bundleDir}/static/**/*.js`;
    console.log(chalk.blue('\nAnalyzing bundle size...'));
    const analysis = execSync(analyzeCommand, { encoding: 'utf-8' });
    // Step 3: Parse and display results
    const bundleResults = parseBundleAnalysis(analysis);
    displayBundleReport(bundleResults, sizeBudgetKB);
    // Step 4: Generate HTML report if requested
    if (options.htmlReport) {
      generateHtmlReport(bundleResults);
    }
    // Step 5: Check against budget
    checkBundleBudget(bundleResults, sizeBudgetKB);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(chalk.red('Bundle analysis failed:'), error.message);
    } else {
      console.error(chalk.red('Bundle analysis failed:'), String(error));
    }
  }
}

function parseBundleAnalysis(analysisOutput: string): BundleAnalysisResults {
  const results: BundleAnalysisResults = {
    totalSize: 0,
    files: [],
    largestDependencies: [],
    warnings: []
  };
  // Simplified parsing logic (real implementation would use proper parsing)
  const sizeRegex = /(\d+\.?\d*)\s*KB/g;
  let match;
  while ((match = sizeRegex.exec(analysisOutput)) !== null) {
    const sizeKB = parseFloat(match[1]);
    results.totalSize += sizeKB;
  }
  // Extract dependency sizes
  const depRegex = /([\w-]+)\s*(\d+\.?\d*)\s*KB/g;
  while ((match = depRegex.exec(analysisOutput)) !== null) {
    results.largestDependencies.push({
      name: match[1],
      size: parseFloat(match[2])
    });
  }
  // Sort dependencies by size
  results.largestDependencies.sort((a, b) => b.size - a.size);
  return results;
}

function displayBundleReport(results: BundleAnalysisResults, budget: number): void {
  console.log(chalk.green.bold('\nBundle Analysis Report'));
  console.log(chalk.cyan('--------------------------------'));
  console.log(`Total Bundle Size: ${chalk.bold(results.totalSize.toFixed(2))} KB`);
  console.log(chalk.cyan('\nTop Dependencies:'));
  results.largestDependencies.slice(0, 5).forEach((dep) => {
    console.log(`- ${dep.name.padEnd(20)} ${dep.size.toFixed(2)} KB`);
  });
  console.log(chalk.cyan('\nRecommendations:'));
  if (results.totalSize > budget) {
    console.log(chalk.yellow(`⚠️ Bundle exceeds budget of ${budget} KB by ${(results.totalSize - budget).toFixed(2)} KB`));
    console.log(chalk.yellow('   Consider code splitting or lazy loading'));
  }
  if (results.largestDependencies.some(d => d.size > 100)) {
    console.log(chalk.yellow('⚠️ Found large dependencies (>100 KB)'));
    console.log(chalk.yellow('   Review if these can be optimized or replaced'));
  }
  if (results.totalSize < budget * 0.7) {
    console.log(chalk.green('✓ Bundle size is well within budget'));
  }
}

function generateHtmlReport(results: BundleAnalysisResults): void {
  const reportDir = 'bundle-reports';
  createFolder(reportDir);
  const reportPath = path.join(reportDir, `bundle-report-${Date.now()}.html`);
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Bundle Analysis Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .summary-item { text-align: center; }
    .summary-value { font-size: 24px; font-weight: bold; }
    .summary-label { color: #666; }
  </style>
</head>
<body>
  <h1>Bundle Analysis Report</h1>
  <div class="card">
    <div class="summary">
      <div class="summary-item">
        <div class="summary-value">${results.totalSize.toFixed(2)} KB</div>
        <div class="summary-label">Total Size</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${results.largestDependencies.length}</div>
        <div class="summary-label">Dependencies</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${results.warnings.length}</div>
        <div class="summary-label">Warnings</div>
      </div>
    </div>
  </div>
  <div class="card">
    <h2>Dependency Sizes</h2>
    <canvas id="dependencyChart" height="400"></canvas>
  </div>
  <script>
    const ctx = document.getElementById('dependencyChart').getContext('2d');
    const dependencies = ${JSON.stringify(results.largestDependencies.slice(0, 15))};
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dependencies.map(d => d.name),
        datasets: [{
          label: 'Size (KB)',
          data: dependencies.map(d => d.size),
          backgroundColor: '#4e73df'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  </script>
</body>
</html>
  `;
  createFile(reportPath, htmlContent);
  console.log(chalk.green(`✅ Generated HTML report: ${path.resolve(reportPath)}`));
}

function checkBundleBudget(results: BundleAnalysisResults, budget: number): void {
  if (results.totalSize > budget) {
    console.log(chalk.red.bold(`\n❌ Bundle exceeds size budget of ${budget} KB`));
    console.log(chalk.red(`  Current size: ${results.totalSize.toFixed(2)} KB`));
    console.log(chalk.red(`  Over budget by: ${(results.totalSize - budget).toFixed(2)} KB`));
    process.exit(1);
  } else {
    console.log(chalk.green.bold('\n✅ Bundle within size budget!'));
    console.log(chalk.green(`  Budget: ${budget} KB`));
    console.log(chalk.green(`  Actual: ${results.totalSize.toFixed(2)} KB`));
  }
}
