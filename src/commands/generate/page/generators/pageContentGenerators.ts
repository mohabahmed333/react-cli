import { PageOptions } from "../generatePage";

 
/**
 * Convert dynamic route pattern to valid component name
 * Examples: _[id] -> DynamicId, _[productId] -> DynamicProductId
 */
export function convertToValidComponentName(pageName: string): string {
  if (pageName.startsWith('_[') && pageName.endsWith(']')) {
    const param = pageName.slice(2, -1);
    return `Dynamic${param.charAt(0).toUpperCase() + param.slice(1)}`;
  }
  return pageName;
}

/**
 * Generate main page component content
 */
export function generatePageContent(name: string, options: PageOptions, useTS: boolean): string {
  const componentName = convertToValidComponentName(name);
  
  // Build imports
  const imports = ['import React from \'react\';'];
  
  if (options.css) {
    imports.push(`import styles from './${name}.module.css';`);
  }
  
  if (options.hooks) {
    imports.push(`import { use${name} } from './hooks/use${name}';`);
  }
  
  if (options.utils) {
    imports.push(`import { ${name.toLowerCase()}Utils } from './utils/${name}Utils';`);
  }
  
  if (options.types && useTS) {
    imports.push(`import type { ${name}Props } from './types/${name}.types';`);
  }
  
  if (options.lib) {
    imports.push(`import { ${name.toUpperCase()}_CONSTANT } from './lib/constants';`);
  }
  
  if (options.perfHook) {
    imports.push(`import { use${name}Performance } from './hooks/use${name}Performance';`);
  }
  
  if (options.perfMonitoring) {
    imports.push(`import ${name}PerformanceWrapper from './components/${name}PerformanceWrapper';`);
  }
  
  // Build component content
  const hookUsage = options.hooks ? `\n  const { data, loading, error, refetch } = use${name}();` : '';
  const perfHookUsage = options.perfHook ? `\n  const { startMeasure, endMeasure } = use${name}Performance();` : '';
  
  // Build JSX content
  let contentJsx = '';
  if (options.hooks) {
    contentJsx = `      <h1>${componentName} Page</h1>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && (
        <div>
          <pre>{${name.toLowerCase()}Utils.formatData(data)}</pre>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}`;
  } else {
    contentJsx = `      <h1>${componentName} Page</h1>
      <p>Welcome to the ${componentName} page!</p>`;
  }
  
  const mainContent = options.css 
    ? `  return (
    <div className={styles.container}>
${contentJsx}
    </div>
  );`
    : `  return (
    <div>
${contentJsx}
    </div>
  );`;
    
  const wrappedContent = options.perfMonitoring 
    ? `  return (
    <${name}PerformanceWrapper showMetrics={process.env.NODE_ENV === 'development'}>
      <div${options.css ? ' className={styles.container}' : ''}>
${contentJsx}
      </div>
    </${name}PerformanceWrapper>
  );`
    : mainContent;
  
  const propsInterface = useTS && options.types 
    ? `interface ${componentName}Props {}`
    : `interface ${componentName}Props {}`;
  
  return useTS
    ? `${imports.join('\n')}

${propsInterface}

const ${componentName}: React.FC<${componentName}Props> = () => {${hookUsage}${perfHookUsage}
${wrappedContent}
};

export default ${componentName};
`
    : `${imports.join('\n')}

const ${componentName} = () => {${hookUsage}${perfHookUsage}
${wrappedContent}
};

export default ${componentName};
`;
}

/**
 * Generate test content for page
 */
export function generateTestContent(name: string, useTS: boolean): string {
  const componentName = convertToValidComponentName(name);
  return useTS
    ? `import { render, screen } from '@testing-library/react';
import ${componentName} from './${name}';

describe('${componentName}', () => {
  it('renders', () => {
    render(<${componentName} />);
    expect(screen.getByText('${componentName} Page')).toBeInTheDocument();
  });
});
`
    : `import { render, screen } from '@testing-library/react';
import ${componentName} from './${name}';

test('renders ${componentName}', () => {
  render(<${componentName} />);
  expect(screen.getByText('${componentName} Page')).toBeInTheDocument();
});
`;
}

/**
 * Generate hook content for page
 */
export function generateHookContent(name: string, useTS: boolean): string {
  return useTS
    ? `import { useState, useEffect, useCallback } from 'react';
import type { ${name}Type } from '../types/${name}.types';

interface Use${name}Return {
  data: ${name}Type | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const use${name} = (): Use${name}Return => {
  const [data, setData] = useState<${name}Type | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      const response = await fetch('/api/${name.toLowerCase()}');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};`
    : `import { useState, useEffect, useCallback } from 'react';

export const use${name} = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      const response = await fetch('/api/${name.toLowerCase()}');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};`;
}

/**
 * Generate utilities content for page
 */
export function generateUtilsContent(name: string, useTS: boolean): string {
  return useTS
    ? `/**
 * Utility functions for ${name} page
 */

export const ${name.toLowerCase()}Utils = {
  /**
   * Format display data for ${name}
   */
  formatData: (data: any): string => {
    if (!data) return 'No data available';
    return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
  },

  /**
   * Validate ${name} input
   */
  validateInput: (input: string): boolean => {
    return input && input.trim().length > 0;
  },

  /**
   * Generate unique ID for ${name}
   */
  generateId: (): string => {
    return \`${name.toLowerCase()}_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  },

  /**
   * Parse URL parameters for ${name}
   */
  parseUrlParams: (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },

  /**
   * Debounce function for ${name} search
   */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }
};`
    : `/**
 * Utility functions for ${name} page
 */

export const ${name.toLowerCase()}Utils = {
  /**
   * Format display data for ${name}
   */
  formatData: (data) => {
    if (!data) return 'No data available';
    return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
  },

  /**
   * Validate ${name} input
   */
  validateInput: (input) => {
    return input && input.trim().length > 0;
  },

  /**
   * Generate unique ID for ${name}
   */
  generateId: () => {
    return \`${name.toLowerCase()}_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  },

  /**
   * Parse URL parameters for ${name}
   */
  parseUrlParams: (search) => {
    const params = new URLSearchParams(search);
    const result = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },

  /**
   * Debounce function for ${name} search
   */
  debounce: (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
};`;
}

/**
 * Generate types content for page
 */
export function generateTypesContent(name: string): string {
  return `/**
 * Type definitions for ${name} page
 */

export interface ${name}Props {
  className?: string;
  onUpdate?: (data: ${name}Type) => void;
  initialData?: ${name}Type;
}

export interface ${name}Type {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface ${name}State {
  data: ${name}Type | null;
  loading: boolean;
  error: string | null;
}

export interface ${name}FormData {
  name: string;
  description?: string;
}

export interface ${name}ApiResponse {
  data: ${name}Type;
  message: string;
  success: boolean;
}

export interface ${name}ListResponse {
  data: ${name}Type[];
  total: number;
  page: number;
  limit: number;
}

export type ${name}Action = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: ${name}Type }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };
`;
}

/**
 * Generate lib content for page
 */
export function generateLibContent(name: string, useTS: boolean): string {
  return useTS
    ? `export const ${name.toUpperCase()}_CONSTANT: string = 'value';\n`
    : `export const ${name.toUpperCase()}_CONSTANT = 'value';\n`;
}

/**
 * Generate CSS content for page
 */
export function generateCSSContent(name: string): string {
  return `.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 24px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color, #333);
  margin-bottom: 16px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 16px;
  color: #c33;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .title {
    font-size: 2rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .title {
    color: var(--primary-color, #fff);
  }
  
  .error {
    background: #4a1a1a;
    border-color: #8a2626;
    color: #ff6b6b;
  }
}
`;
}

/**
 * Generate layout content for page (Next.js)
 */
export function generateLayoutContent(useTS: boolean): string {
  return useTS
    ? `import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
}
`
    : `export default function Layout({ children }) {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
}
`;
}
