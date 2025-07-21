import { LibraryConfig } from "./types";


export abstract class BaseLibrary implements LibraryConfig {
  abstract name: string;
  abstract packages: string;
  abstract devPackages: string;

  async setup(projectPath: string, isTypeScript: boolean): Promise<void> {
    // Default implementation
  }
}
