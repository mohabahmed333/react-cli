import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLibrary } from '../baseLibrary';

export class ReactRouterLibrary extends BaseLibrary {
  name = 'React Router';
  packages = 'react-router-dom';
  devPackages = '';

  async setup(projectPath: string, isTypeScript: boolean): Promise<void> {
    // Copy template files
    const templatePath = path.join(__dirname, 'templates');
    await fs.copy(templatePath, projectPath);
    
    // Update main file with Router
    const entryFile = isTypeScript ? 'src/main.tsx' : 'src/main.jsx';
    const content = await fs.readFile(path.join(projectPath, entryFile), 'utf8');
    
    const updatedContent = content
      .replace(
        /import App from ['"]\.\/App['"];/,
        `import { BrowserRouter as Router } from 'react-router-dom';\nimport App from './App';`
      )
      .replace(
        /<App\s?\/>/,
        `<Router>\n    <App />\n  </Router>`
      );
    
    await fs.writeFile(path.join(projectPath, entryFile), updatedContent);
  }
}
