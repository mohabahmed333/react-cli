import { CLIConfig } from './config';

interface BuildToolConfig {
  id: string;
  startCommand: string;
  defaultPort: number;
}

type BuildToolId = 'vite' | 'next' | 'react-scripts';

export const buildTools: Record<BuildToolId, BuildToolConfig> = {
  vite: {
    id: 'vite',
    startCommand: 'vite',
    defaultPort: 5173
  },
  next: {
    id: 'next',
    startCommand: 'next start',
    defaultPort: 3000
  },
  'react-scripts': {
    id: 'react-scripts',
    startCommand: 'react-scripts start',
    defaultPort: 3000
  }
};

interface BuildToolConfigInput {
  buildTool?: BuildToolId;
  projectType?: 'react' | 'next';
}

export function getBuildToolConfig(config: BuildToolConfigInput): BuildToolConfig {
  if (config.buildTool && buildTools[config.buildTool]) {
    return buildTools[config.buildTool];
  }

  // For backwards compatibility
  if (config.projectType === 'next') {
    return buildTools.next;
  }

  return buildTools['react-scripts'];
}

export function getDevServerPort(config: CLIConfig): number {
  if (config.port) {
    return config.port;
  }

  const toolConfig = getBuildToolConfig(config);
  return toolConfig.defaultPort;
}

export function getStartCommand(config: CLIConfig): string {
  const toolConfig = getBuildToolConfig(config);
  return toolConfig.startCommand;
}

export function getIgnoredPaths(): string[] {
  return [
    'node_modules/**/*',
    'dist/**/*',
    'build/**/*',
    '.next/**/*',
    'coverage/**/*',
    '.git/**/*',
    'src/**/templates/**/*',
  ];
}

// For CommonJS compatibility
module.exports = {
  buildTools,
  getBuildToolConfig,
  getDevServerPort,
  getStartCommand,
  getIgnoredPaths
};
