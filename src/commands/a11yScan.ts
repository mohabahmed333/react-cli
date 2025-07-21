import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../utils/config';
import { createFile, createFolder } from '../utils/file';
import { getDevServerPort, getStartCommand } from '../utils/buildTools';

export function handleA11yScan(program: Command, rl: any) {
  program
    .command('a11y-scan')
    .description('Check accessibility compliance')
    .option('--fix', 'Attempt to fix common issues')
    .option('--report', 'Generate detailed HTML report')
    .option('--component <path>', 'Scan specific component file')
    .option('--url <url>', 'Scan specific URL (local or remote)')
    .option('--level <level>', 'WCAG level (A, AA, AAA)', 'AA')
    .action(async (options: any) => {
      const config = await setupConfiguration(rl);
      await runA11yScan(config, options);
    });
}

async function runA11yScan(config: any, options: any) {
  console.log(chalk.cyan.bold('\n♿ Starting accessibility scan...'));
  try {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const axios = require('axios');
    const { JSDOM } = require('jsdom');
    const axeCore = require('axe-core');
    const color = require('color');
    // 1. Setup paths and URLs
    const port = getDevServerPort(config);
    const appUrl = options.url || `http://localhost:${port}`;
    const scanTarget = options.component 
      ? path.resolve(options.component)
      : appUrl;
    // 2. Start development server if needed
    let serverProcess;
    if (!options.url && !options.component) {
      console.log(chalk.blue('Starting development server...'));
      const startCommand = getStartCommand(config);
      serverProcess = execSync(`${startCommand} &`, { 
        detached: true,
        stdio: 'ignore'
      });
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    // 3. Run accessibility scan
    let results;
    if (options.component) {
      console.log(chalk.blue(`Scanning component: ${scanTarget}`));
      results = await scanComponent(scanTarget, options.level);
    } else {
      console.log(chalk.blue(`Scanning URL: ${scanTarget}`));
      results = await scanUrl(scanTarget, options.level);
    }
    // 4. Display results
    displayA11yResults(results, options.level);
    // 5. Generate report
    if (options.report) {
      generateA11yReport(results, config);
    }
    // 6. Attempt fixes
    if (options.fix && options.component) {
      await attemptFixes(scanTarget, results);
    }
    // 7. Cleanup
    if (serverProcess) {
      process.kill(-serverProcess.pid);
    }
  } catch (error: any) {
    console.error(chalk.red('Accessibility scan failed:'), error.message);
    process.exit(1);
  }
}


async function scanComponent(componentPath: string, level: string) {
  const fs = require('fs');
  const { JSDOM } = require('jsdom');
  const axeCore = require('axe-core');
  // Read component file
  const componentCode = fs.readFileSync(componentPath, 'utf8');
  // Create DOM environment
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <head><title>Component Test</title></head>
    <body>
      <div id="root"></div>
      <script>${componentCode}</script>
      <script>
        ReactDOM.render(React.createElement(${getComponentName(componentPath)}), 
        document.getElementById('root'));
      </script>
    </body>
    </html>
  `);
  // Run axe-core
  const results = await dom.window.evaluate(async (level: string) => {
    const axe = require('axe-core');
    axe.configure({
      rules: [{
        id: 'color-contrast',
        enabled: true
      }]
    });
    return axe.run({
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', `wcag${level.toLowerCase()}`]
      }
    });
  }, level);
  return results;
}

async function scanUrl(url: string, level: string) {
  const axios = require('axios');
  const { JSDOM } = require('jsdom');
  const axeCore = require('axe-core');
  // Fetch page content
  const response = await axios.get(url);
  const html = response.data;
  // Create DOM environment
  const dom = new JSDOM(html, {
    url,
    runScripts: 'dangerously',
    resources: 'usable'
  });
  // Inject axe-core
  const axeScript = dom.window.document.createElement('script');
  axeScript.textContent = axeCore.source;
  dom.window.document.head.appendChild(axeScript);
  // Run accessibility tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  const results = await dom.window.evaluate(async (level: string) => {
    return new Promise(resolve => {
      (window as any).axe.run({
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', `wcag${level.toLowerCase()}`]
        }
      }, (err: any, results: any) => {
        if (err) throw err;
        resolve(results);
      });
    });
  }, level);
  return results;
}

function displayA11yResults(results: any, level: string) {
  const violations = results.violations || [];
  const passes = results.passes || [];
  const incomplete = results.incomplete || [];
  console.log(chalk.green.bold('\nAccessibility Scan Results'));
  console.log(chalk.cyan('--------------------------------'));
  console.log(`WCAG Compliance Level: ${chalk.bold(level)}`);
  console.log(`Scanned: ${results.url || results.component}`);
  console.log(chalk.cyan('\nSummary:'));
  console.log(`✅ ${passes.length} Passed checks`);
  console.log(`⚠️ ${incomplete.length} Needs review`);
  console.log(`❌ ${violations.length} Critical violations`);
  if (violations.length > 0) {
    console.log(chalk.red.bold('\nCritical Accessibility Issues:'));
    violations.forEach((violation: any, i: number) => {
      console.log(`\n${i+1}. ${chalk.bold(violation.id)}: ${violation.help}`);
      console.log(`   Impact: ${violation.impact}`);
      console.log(`   Elements affected: ${violation.nodes.length}`);
      if (violation.nodes.length > 0) {
        console.log(chalk.yellow('   Example element:'));
        console.log(`   ${violation.nodes[0].html}`);
      }
      console.log(chalk.blue('   How to fix:'));
      violation.helpUrl && console.log(`   Documentation: ${violation.helpUrl}`);
    });
  }
  if (incomplete.length > 0) {
    console.log(chalk.yellow.bold('\nItems Needing Manual Review:'));
    incomplete.forEach((item: any, i: number) => {
      console.log(`\n${i+1}. ${chalk.bold(item.id)}: ${item.help}`);
      console.log(`   Impact: ${item.impact}`);
    });
  }
  console.log(chalk.cyan('\nRecommendations:'));
  if (violations.length === 0 && incomplete.length === 0) {
    console.log(chalk.green('✓ Excellent accessibility compliance!'));
  } else {
    if (violations.length > 0) {
      console.log(chalk.yellow('⚠️ Fix critical issues listed above'));
    }
    if (incomplete.length > 0) {
      console.log(chalk.yellow('⚠️ Review items needing manual verification'));
    }
    console.log(chalk.blue('💡 Run with --report for detailed HTML report'));
    if (violations.length > 0) {
      console.log(chalk.blue('💡 Run with --fix to attempt automatic corrections'));
    }
  }
}

function generateA11yReport(results: any, config: any) {
  const reportDir = 'a11y-reports';
  createFolder(reportDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `a11y-report-${timestamp}.html`);
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    .violation-card { border-left: 4px solid #dc3545; }
    .review-card { border-left: 4px solid #ffc107; }
    .pass-card { border-left: 4px solid #28a745; }
    .element-preview { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; }
    .impact-high { background-color: #dc3545; color: white; }
    .impact-medium { background-color: #ffc107; }
    .impact-minor { background-color: #6c757d; color: white; }
  </style>
</head>
<body>
  <div class="container my-5">
    <h1 class="mb-4">Accessibility Report</h1>
    <div class="card mb-4">
      <div class="card-body">
        <h2 class="card-title">Summary</h2>
        <div class="row">
          <div class="col-md-3 text-center">
            <div class="display-4 text-success">${results.passes.length}</div>
            <div>Passed Checks</div>
          </div>
          <div class="col-md-3 text-center">
            <div class="display-4 text-warning">${results.incomplete.length}</div>
            <div>Needs Review</div>
          </div>
          <div class="col-md-3 text-center">
            <div class="display-4 text-danger">${results.violations.length}</div>
            <div>Violations</div>
          </div>
          <div class="col-md-3 text-center">
            <div class="display-4">${new Date().toLocaleString()}</div>
            <div>Generated</div>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <canvas id="severityChart" height="250"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <canvas id="issueTypeChart" height="250"></canvas>
          </div>
        </div>
      </div>
    </div>
    ${results.violations.length > 0 ? `
    <div class="card mb-4">
      <div class="card-header bg-danger text-white">
        <h2 class="mb-0">Accessibility Violations (${results.violations.length})</h2>
      </div>
      <div class="card-body">
        ${results.violations.map((violation: any, i: number) => `
        <div class="card violation-card mb-3">
          <div class="card-body">
            <h3 class="card-title">${i+1}. ${violation.id}: ${violation.help}</h3>
            <div class="mb-2">
              <span class="badge impact-${violation.impact} me-2">${violation.impact}</span>
              <span class="badge bg-secondary">WCAG ${violation.tags.filter((t: string) => t.startsWith('wcag')).join(', ')}</span>
            </div>
            <p class="card-text">${violation.description}</p>
            <h5>Affected Elements (${violation.nodes.length}):</h5>
            ${violation.nodes.slice(0, 3).map((node: any) => `
            <div class="mb-2">
              <div class="element-preview">${node.html}</div>
              <div class="mt-1">${node.failureSummary}</div>
            </div>
            `).join('')}
            <h5>How to Fix:</h5>
            <ul>
              ${violation.any.map((fix: any) => `<li>${fix.message}</li>`).join('')}
            </ul>
            <a href="${violation.helpUrl}" target="_blank" class="btn btn-sm btn-outline-primary">Documentation</a>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    ${results.incomplete.length > 0 ? `
    <div class="card mb-4">
      <div class="card-header bg-warning text-dark">
        <h2 class="mb-0">Items Needing Manual Review (${results.incomplete.length})</h2>
      </div>
      <div class="card-body">
        ${results.incomplete.map((item: any, i: number) => `
        <div class="card review-card mb-3">
          <div class="card-body">
            <h3 class="card-title">${i+1}. ${item.id}: ${item.help}</h3>
            <div class="mb-2">
              <span class="badge impact-${item.impact} me-2">${item.impact}</span>
            </div>
            <p class="card-text">${item.description}</p>
            <a href="${item.helpUrl}" target="_blank" class="btn btn-sm btn-outline-primary">Documentation</a>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  </div>
  <script>
    // Severity distribution chart
    const severityCtx = document.getElementById('severityChart').getContext('2d');
    const severityData = {
      labels: ['Critical', 'Serious', 'Moderate', 'Minor'],
      datasets: [{
        label: 'Violations by Severity',
        data: [
          ${results.violations.filter((v: any) => v.impact === 'critical').length},
          ${results.violations.filter((v: any) => v.impact === 'serious').length},
          ${results.violations.filter((v: any) => v.impact === 'moderate').length},
          ${results.violations.filter((v: any) => v.impact === 'minor').length}
        ],
        backgroundColor: [
          '#dc3545', '#ffc107', '#6c757d', '#0dcaf0'
        ]
      }]
    };
    new Chart(severityCtx, {
      type: 'doughnut',
      data: severityData,
      options: { responsive: true }
    });
    // Issue type chart
    const issueTypeCtx = document.getElementById('issueTypeChart').getContext('2d');
    const issueTypes = [...new Set(${JSON.stringify(results.violations.map((v: any) => v.id))})];
    const issueTypeData = {
      labels: issueTypes,
      datasets: [{
        label: 'Violations by Type',
        data: issueTypes.map(type => 
          ${JSON.stringify(results.violations)}.filter((v: any) => v.id === type).length
        ),
        backgroundColor: '#0d6efd'
      }]
    };
    new Chart(issueTypeCtx, {
      type: 'bar',
      data: issueTypeData,
      options: {
        indexAxis: 'y',
        responsive: true
      }
    });
  </script>
</body>
</html>
  `;
  createFile(reportPath, htmlContent);
  console.log(chalk.green(`✅ Generated accessibility report: ${path.resolve(reportPath)}`));
}

async function attemptFixes(componentPath: string, results: any) {
  const fs = require('fs');
  const color = require('color');
  let componentCode = fs.readFileSync(componentPath, 'utf8');
  let fixed = false;
  results.violations.forEach((violation: any) => {
    if (violation.id === 'color-contrast') {
      violation.nodes.forEach((node: any) => {
        const contrastIssue = node.any.find((a: any) => a.id === 'color-contrast');
        if (contrastIssue) {
          const elementHtml = node.html;
          const regex = /style={{[^}]*}}/g;
          const styleMatches = componentCode.match(regex);
          if (styleMatches) {
            styleMatches.forEach((style: string) => {
              const fgRegex = /color:\s*['"]([^'"]+)['"]/;
              const bgRegex = /background(?:-color)?:\s*['"]([^'"]+)['"]/;
              const fgMatch = style.match(fgRegex);
              const bgMatch = style.match(bgRegex);
              if (fgMatch && bgMatch) {
                const fgColor = color(fgMatch[1]);
                const bgColor = color(bgMatch[1]);
                const contrast = color(bgColor).contrast(fgColor);
                if (contrast < 4.5) {
                  let newFgColor = fgColor;
                  let newBgColor = bgColor;
                  if (bgColor.luminosity() > 0.5) {
                    newFgColor = fgColor.darken(0.3);
                  } else {
                    newFgColor = fgColor.lighten(0.3);
                  }
                  const newContrast = color(newBgColor).contrast(newFgColor);
                  if (newContrast > contrast) {
                    const newStyle = style
                      .replace(fgMatch[0], `color: '${newFgColor.hex()}'`)
                      .replace(bgMatch[0], `backgroundColor: '${newBgColor.hex()}'`);
                    componentCode = componentCode.replace(style, newStyle);
                    fixed = true;
                    console.log(chalk.green(`✓ Improved contrast from ${contrast.toFixed(2)} to ${newContrast.toFixed(2)}`));
                  }
                }
              }
            });
          }
        }
      });
    }
    // Add more fixers for other violation types...
  });
  if (fixed) {
    const backupPath = componentPath + '.bak';
    fs.copyFileSync(componentPath, backupPath);
    fs.writeFileSync(componentPath, componentCode);
    console.log(chalk.green(`✓ Modified component: ${componentPath}`));
    console.log(chalk.yellow(`⚠️ Original backed up to: ${backupPath}`));
  } else {
    console.log(chalk.yellow('⚠️ No automatic fixes could be applied'));
  }
}

function getComponentName(componentPath: string) {
  return path.basename(componentPath)
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_$]/g, '');
}
