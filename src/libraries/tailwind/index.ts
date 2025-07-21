import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLibrary } from '../baseLibrary';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class TailwindCSSLibrary extends BaseLibrary {
  name = 'Tailwind CSS';
  packages = 'tailwindcss postcss autoprefixer';
  devPackages = '';

  async setup(projectPath: string): Promise<void> {
    // Initialize Tailwind
    await execAsync('npx tailwindcss init -p', { cwd: projectPath });
    
    // Copy config files
    await fs.copy(path.join(__dirname, 'templates'), projectPath);
    
    // Add Tailwind directives to CSS
    const cssPath = path.join(projectPath, 'src/index.css');
    await fs.writeFile(
      cssPath,
      '@tailwind base;\n@tailwind components;\n@tailwind utilities;'
    );
  }
}
