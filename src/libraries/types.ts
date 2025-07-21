export interface LibraryConfig {
  name: string;
  packages: string;
  devPackages: string;
  setup(projectPath: string, isTypeScript: boolean): Promise<void>;
}

export interface LibraryRegistry {
  [key: string]: LibraryConfig;
}
