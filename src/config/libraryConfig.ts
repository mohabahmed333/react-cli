/**
 * Library-level AI configuration
 * This controls whether AI features are available in the CLI at all
 * Separate from user's project configuration
 */

/**
 * LIBRARY CONFIGURATION - Set by library maintainer
 * This controls whether AI features are built into the CLI
 */
export const LIBRARY_AI_CONFIG = {
  // Set to true to enable AI features in the library
  // Set to false to completely disable AI for all users
  AI_FEATURES_ENABLED: false,
  
  // Available providers (can be restricted by library maintainer)
  AVAILABLE_PROVIDERS: ['gemini', 'mistral'] as const,
  
  // Default provider when AI is enabled
  DEFAULT_PROVIDER: 'gemini' as const,
  
  // Features that can be controlled individually
  FEATURES: {
    CODE_GENERATION: false,
    DOCUMENTATION: false,
    REFACTORING: false,
    TESTING: false
  }
};

/**
 * Check if AI features are enabled at the library level
 */
export function isLibraryAIEnabled(): boolean {
  return LIBRARY_AI_CONFIG.AI_FEATURES_ENABLED;
}

/**
 * Check if a specific AI feature is enabled at the library level
 */
export function isLibraryFeatureEnabled(feature: keyof typeof LIBRARY_AI_CONFIG.FEATURES): boolean {
  return LIBRARY_AI_CONFIG.AI_FEATURES_ENABLED && LIBRARY_AI_CONFIG.FEATURES[feature];
}

/**
 * Get available AI providers based on library configuration
 */
export function getAvailableProviders(): readonly string[] {
  if (!LIBRARY_AI_CONFIG.AI_FEATURES_ENABLED) {
    return [];
  }
  return LIBRARY_AI_CONFIG.AVAILABLE_PROVIDERS;
}

/**
 * Check if AI commands should be registered at all
 */
export function shouldRegisterAICommands(): boolean {
  return LIBRARY_AI_CONFIG.AI_FEATURES_ENABLED;
}
