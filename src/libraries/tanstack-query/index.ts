import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLibrary } from '../baseLibrary';

export class TanStackQueryLibrary extends BaseLibrary {
  name = 'TanStack Query';
  packages = '@tanstack/react-query';
  devPackages = '@tanstack/react-query-devtools';

  async setup(projectPath: string, isTypeScript: boolean): Promise<void> {
    const entryFile = isTypeScript ? 'src/main.tsx' : 'src/main.jsx';
    const content = await fs.readFile(path.join(projectPath, entryFile), 'utf8');
    
    const updatedContent = content
      .replace(
        /import App from ['"]\.\/App['"];/,
        `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';\nimport App from './App';\n\nconst queryClient = new QueryClient();`
      )
      .replace(
        /<App\s?\/>/,
        `<QueryClientProvider client={queryClient}>\n    <App />\n  </QueryClientProvider>`
      );
    
    await fs.writeFile(path.join(projectPath, entryFile), updatedContent);
    
    if (isTypeScript) {
      await fs.copy(path.join(__dirname, 'templates'), projectPath);
    }
  }
}
