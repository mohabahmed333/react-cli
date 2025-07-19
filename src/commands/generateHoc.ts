import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../utils/config';
import { createFile, createFolder } from '../utils/file';

export function registerGenerateHoc(generate: Command, rl: any) {
  generate
    .command('hoc <name>')
    .description('Create a higher-order component')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const ext = config.typescript ? 'tsx' : 'jsx';
      const folderPath = path.join(config.baseDir, 'hocs');
      createFolder(folderPath);
      const filePath = path.join(folderPath, `with${name}.${ext}`);
      const content = config.typescript
        ? `import React from 'react';\n\nexport function with${name}<P extends object>(\n  WrappedComponent: React.ComponentType<P>\n) {\n  const ComponentWith${name} = (props: P) => {\n    // Add your HOC logic here\n    return <WrappedComponent {...props} />;\n  };\n\n  return ComponentWith${name};\n}\n`
        : `import React from 'react';\n\nexport function with${name}(WrappedComponent) {\n  return function ComponentWith${name}(props) {\n    // Add your HOC logic here\n    return <WrappedComponent {...props} />;\n  };\n}\n`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created HOC: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ HOC exists: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
}
