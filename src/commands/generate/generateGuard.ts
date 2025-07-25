import { Command } from 'commander';
import chalk from 'chalk';
import { setupConfiguration } from '../../utils/config';
import { Interface as ReadlineInterface } from 'readline';
import { GenerateOptions } from '../../utils/generateAIHelper';
import { handleInteractiveName } from '../../utils/shared/handleInteractiveName';
import { handleTargetDirectory } from '../../utils/file/handleTargetDirectory';
import { createGeneratedFile } from '../../utils/file/createGeneratedFile';

export function registerGenerateGuard(generate: Command, rl: ReadlineInterface) {
  generate
    .command('guard [name] [folder]')
    .description('Generate an authentication guard (optionally in a specific folder under app/)')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode for Guard and folder selection')
    .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = config.typescript;

        const guardName = await handleInteractiveName(
          rl,
          name,
          'guard',
          {
            pattern: /^[A-Z][a-zA-Z0-9]*$/,
            patternError: "❌ Guard name must be PascalCase and start with a capital letter"
          }
        );

        const targetDir = await handleTargetDirectory(
          rl,
          config,
          folder,
          'guards',
          options.interactive ?? false
        );

        const defaultContent = useTS
          ? `import { Navigate, useLocation } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\n\nexport default function ${guardName}Guard({ children }: { children: JSX.Element }) {\n  const { currentUser } = useAuth();\n  const location = useLocation();\n\n  if (!currentUser) {\n    return <Navigate to="/login" state={{ from: location }} replace />;\n  }\n\n  return children;\n}\n`
          : `import { Navigate, useLocation } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\n\nexport default function ${guardName}Guard({ children }) {\n  const { currentUser } = useAuth();\n  const location = useLocation();\n\n  if (!currentUser) {\n    return <Navigate to="/login" state={{ from: location }} replace />;\n  }\n\n  return children;\n}\n`;

        await createGeneratedFile({
          rl,
          config,
          type: 'guard',
          name: guardName,
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent,
          aiOptions: {
            features: '',
            additionalPrompt: `Create an authentication guard named ${guardName}Guard in ${useTS ? 'TypeScript' : 'JavaScript'} with JSDoc comments. The guard should protect routes by checking for authenticated users.`
          }
        });
      } catch (error) {
        console.error(chalk.red('❌ Error generating guard:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}