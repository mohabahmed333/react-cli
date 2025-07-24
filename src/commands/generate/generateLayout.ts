import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { createFile, createFolder } from '../../utils/file';

export function registerGenerateLayout(generate: Command, rl: any) {
  generate
    .command('layout <name>')
    .description('Create a layout component with nested routing support')
    .option('--sidebar', 'Include sidebar')
    .option('--navbar', 'Include navigation bar')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const ext = config.typescript ? 'tsx' : 'jsx';
      const folderPath = path.join(config.baseDir, 'layouts');
      createFolder(folderPath);
      const filePath = path.join(folderPath, `${name}Layout.${ext}`);
      const sidebar = options.sidebar ? `{/* Sidebar content here */}\n` : '';
      const navbar = options.navbar ? `{/* Navbar content here */}\n` : '';
      const content = config.typescript
        ? `import { Outlet } from 'react-router-dom';\n\nexport default function ${name}Layout() {\n  return (\n    <div className=\"${name.toLowerCase()}-layout\">\n      ${navbar}\n      <div className=\"layout-content\">\n        ${sidebar}\n        <main>\n          <Outlet />\n        </main>\n      </div>\n    </div>\n  );\n}\n`
        : `import { Outlet } from 'react-router-dom';\n\nexport default function ${name}Layout() {\n  return (\n    <div className=\"${name.toLowerCase()}-layout\">\n      ${navbar}\n      <div className=\"layout-content\">\n        ${sidebar}\n        <main>\n          <Outlet />\n        </main>\n      </div>\n    </div>\n  );\n}\n`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created layout: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Layout exists: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
}
