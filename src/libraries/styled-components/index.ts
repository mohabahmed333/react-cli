import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLibrary } from '../baseLibrary';

export class StyledComponentsLibrary extends BaseLibrary {
  name = 'Styled Components';
  packages = 'styled-components';
  devPackages = '@types/styled-components';

  async setup(projectPath: string, isTypeScript: boolean): Promise<void> {
    await fs.ensureDir(path.join(projectPath, 'src/styles'));
    await fs.copy(path.join(__dirname, 'templates'), path.join(projectPath, 'src/styles'));
    
    // Add theme provider setup if needed
    if (isTypeScript) {
      await fs.copy(
        path.join(__dirname, 'templates-ts'),
        path.join(projectPath, 'src/styles')
      );
    }
  }
}
