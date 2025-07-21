import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLibrary } from '../baseLibrary';

export class ReduxToolkitLibrary extends BaseLibrary {
  name = 'Redux Toolkit';
  packages = '@reduxjs/toolkit react-redux';
  devPackages = '';

  async setup(projectPath: string, isTypeScript: boolean): Promise<void> {
    // Create Redux store structure
    await fs.ensureDir(path.join(projectPath, 'src/app'));
    await fs.ensureDir(path.join(projectPath, 'src/features'));
    
    // Copy template files
    const templatePath = path.join(__dirname, 'templates');
    await fs.copy(templatePath, projectPath);
    
    // Add provider to main file
    const entryFile = isTypeScript ? 'src/main.tsx' : 'src/main.jsx';
    const content = await fs.readFile(path.join(projectPath, entryFile), 'utf8');
    
    const updatedContent = content
      .replace(
        /import App from ['"]\.\/App['"];/,
        `import { Provider } from 'react-redux';\nimport { store } from './app/store';\nimport App from './App';`
      )
      .replace(
        /<App\s?\/>/,
        `<Provider store={store}>\n    <App />\n  </Provider>`
      );
    
    await fs.writeFile(path.join(projectPath, entryFile), updatedContent);
  }
}
