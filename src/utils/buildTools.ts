interface BuildToolConfig {
  id: string;
  startCommand: string;
  defaultPort: number;
}

export const buildTools: Record<string, BuildToolConfig> = {
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

export function getBuildToolConfig(config: any): BuildToolConfig {
  if (config.buildTool && buildTools[config.buildTool]) {
    return buildTools[config.buildTool];
  }

  // For backwards compatibility
  if (config.projectType === 'next') {
    return buildTools.next;
  }

  return buildTools['react-scripts'];
}

export function getDevServerPort(config: any): number {
  if (config.port) {
    return config.port;
  }

  const toolConfig = getBuildToolConfig(config);
  return toolConfig.defaultPort;
}

export function getStartCommand(config: any): string {
  const toolConfig = getBuildToolConfig(config);
  return toolConfig.startCommand;
}

// For CommonJS compatibility
module.exports = {
  buildTools,
  getBuildToolConfig,
  getDevServerPort,
  getStartCommand
};
