import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLibrary } from '../baseLibrary';

export class ZustandLibrary extends BaseLibrary {
  name = 'Zustand';
  packages = 'zustand';
  devPackages = '';

  async setup(projectPath: string): Promise<void> {
    await fs.ensureDir(path.join(projectPath, 'src/store'));
    await fs.copy(path.join(__dirname, 'templates'), path.join(projectPath, 'src/store'));
  }
}
