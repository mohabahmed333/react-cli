import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLibrary } from '../baseLibrary';

export class MaterialUILibrary extends BaseLibrary {
  name = 'Material UI';
  packages = '@mui/material @emotion/react @emotion/styled';
  devPackages = '';

  async setup(projectPath: string): Promise<void> {
    // Add Roboto font and basic styles
    const indexFile = path.join(projectPath, 'index.html');
    let content = await fs.readFile(indexFile, 'utf8');
    
    content = content.replace(
      '</head>',
      `  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>\n  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>\n</head>`
    );
    
    await fs.writeFile(indexFile, content);
    await fs.copy(path.join(__dirname, 'templates'), projectPath);
  }
}
