import { BaseLibrary } from '../baseLibrary';

export class ReactIconsLibrary extends BaseLibrary {
  name = 'React Icons';
  packages = 'react-icons';
  devPackages = '';

  async setup(): Promise<void> {
    // No setup needed - just installation
  }
}
