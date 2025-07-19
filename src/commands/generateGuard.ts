import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../utils/config';
import { createFile, createFolder } from '../utils/file';

export function registerGenerateGuard(generate: Command, rl: any) {
  generate
    .command('guard <name>')
    .description('Create an authentication guard for protected routes')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const ext = config.typescript ? 'tsx' : 'jsx';
      const folderPath = path.join(config.baseDir, 'guards');
      createFolder(folderPath);
      const filePath = path.join(folderPath, `${name}Guard.${ext}`);
      const content = config.typescript
        ? `import { Navigate, useLocation } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\n\nexport default function ${name}Guard({ children }: { children: JSX.Element }) {\n  const { currentUser } = useAuth();\n  const location = useLocation();\n\n  if (!currentUser) {\n    return <Navigate to=\"/login\" state={{ from: location }} replace />;\n  }\n\n  return children;\n}\n`
        : `import { Navigate, useLocation } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\n\nexport default function ${name}Guard({ children }) {\n  const { currentUser } = useAuth();\n  const location = useLocation();\n\n  if (!currentUser) {\n    return <Navigate to=\"/login\" state={{ from: location }} replace />;\n  }\n\n  return children;\n}\n`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created auth guard: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Guard exists: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
}
