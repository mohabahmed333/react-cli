"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBundleCheck = handleBundleCheck;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function handleBundleCheck(program, rl) {
    program
        .command('bundle-check')
        .description('Analyze application bundle size and dependencies')
        .option('--watch', 'Monitor bundle size in real-time')
        .option('--budget <kb>', 'Set size budget in KB (default: 500)', '500')
        .option('--html-report', 'Generate HTML report')
        .action(async (options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        await performBundleAnalysis(config, options);
    });
}
async function performBundleAnalysis(config, options) {
    console.log(chalk_1.default.cyan.bold('\n📦 Starting bundle analysis...'));
    try {
        const { execSync } = require('child_process');
        const projectType = config.projectType;
        const sizeBudgetKB = parseInt(options.budget || '500', 10);
        // Step 1: Build the project
        console.log(chalk_1.default.blue('Building project for analysis...'));
        const buildCommand = projectType === 'next'
            ? 'next build'
            : 'scripts build';
        execSync(buildCommand, { stdio: 'inherit' });
        // Step 2: Analyze bundle
        const bundleDir = projectType === 'next' ? '.next' : 'build';
        const analyzeCommand = `npx source-map-explorer ${bundleDir}/static/**/*.js`;
        console.log(chalk_1.default.blue('\nAnalyzing bundle size...'));
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
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk_1.default.red('Bundle analysis failed:'), error.message);
        }
        else {
            console.error(chalk_1.default.red('Bundle analysis failed:'), String(error));
        }
    }
}
function parseBundleAnalysis(analysisOutput) {
    const results = {
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
function displayBundleReport(results, budget) {
    console.log(chalk_1.default.green.bold('\nBundle Analysis Report'));
    console.log(chalk_1.default.cyan('--------------------------------'));
    console.log(`Total Bundle Size: ${chalk_1.default.bold(results.totalSize.toFixed(2))} KB`);
    console.log(chalk_1.default.cyan('\nTop Dependencies:'));
    results.largestDependencies.slice(0, 5).forEach((dep) => {
        console.log(`- ${dep.name.padEnd(20)} ${dep.size.toFixed(2)} KB`);
    });
    console.log(chalk_1.default.cyan('\nRecommendations:'));
    if (results.totalSize > budget) {
        console.log(chalk_1.default.yellow(`⚠️ Bundle exceeds budget of ${budget} KB by ${(results.totalSize - budget).toFixed(2)} KB`));
        console.log(chalk_1.default.yellow('   Consider code splitting or lazy loading'));
    }
    if (results.largestDependencies.some(d => d.size > 100)) {
        console.log(chalk_1.default.yellow('⚠️ Found large dependencies (>100 KB)'));
        console.log(chalk_1.default.yellow('   Review if these can be optimized or replaced'));
    }
    if (results.totalSize < budget * 0.7) {
        console.log(chalk_1.default.green('✓ Bundle size is well within budget'));
    }
}
function generateHtmlReport(results) {
    const reportDir = 'bundle-reports';
    (0, file_1.createFolder)(reportDir);
    const reportPath = path_1.default.join(reportDir, `bundle-report-${Date.now()}.html`);
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
    (0, file_1.createFile)(reportPath, htmlContent);
    console.log(chalk_1.default.green(`✅ Generated HTML report: ${path_1.default.resolve(reportPath)}`));
}
function checkBundleBudget(results, budget) {
    if (results.totalSize > budget) {
        console.log(chalk_1.default.red.bold(`\n❌ Bundle exceeds size budget of ${budget} KB`));
        console.log(chalk_1.default.red(`  Current size: ${results.totalSize.toFixed(2)} KB`));
        console.log(chalk_1.default.red(`  Over budget by: ${(results.totalSize - budget).toFixed(2)} KB`));
        process.exit(1);
    }
    else {
        console.log(chalk_1.default.green.bold('\n✅ Bundle within size budget!'));
        console.log(chalk_1.default.green(`  Budget: ${budget} KB`));
        console.log(chalk_1.default.green(`  Actual: ${results.totalSize.toFixed(2)} KB`));
    }
}
