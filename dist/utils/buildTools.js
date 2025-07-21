"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTools = void 0;
exports.getBuildToolConfig = getBuildToolConfig;
exports.getDevServerPort = getDevServerPort;
exports.getStartCommand = getStartCommand;
exports.buildTools = {
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
function getBuildToolConfig(config) {
    if (config.buildTool && exports.buildTools[config.buildTool]) {
        return exports.buildTools[config.buildTool];
    }
    // For backwards compatibility
    if (config.projectType === 'next') {
        return exports.buildTools.next;
    }
    return exports.buildTools['react-scripts'];
}
function getDevServerPort(config) {
    if (config.port) {
        return config.port;
    }
    const toolConfig = getBuildToolConfig(config);
    return toolConfig.defaultPort;
}
function getStartCommand(config) {
    const toolConfig = getBuildToolConfig(config);
    return toolConfig.startCommand;
}
// For CommonJS compatibility
module.exports = {
    buildTools: exports.buildTools,
    getBuildToolConfig,
    getDevServerPort,
    getStartCommand
};
