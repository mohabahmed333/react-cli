import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLibrary } from '../baseLibrary';

export class AxiosLibrary extends BaseLibrary {
  name = 'Axios';
  packages = 'axios';
  devPackages = '';

  async setup(projectPath: string): Promise<void> {
    await fs.ensureDir(path.join(projectPath, 'src/api'));
    await fs.copy(path.join(__dirname, 'templates'), path.join(projectPath, 'src/api'));
  }
}
