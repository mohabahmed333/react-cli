import { generateAxiosHandlerTS, generateErrorHandlerTS } from "./generateErrorHandling";

export interface AxiosCrudTemplateParams {
    resource: string;
    Resource: string;
    errorHandler: string;
  }
  
  export function generateAxiosCrudTS({ resource, Resource, errorHandler }: AxiosCrudTemplateParams): string {
    return `// src/services/${resource}Service.ts
  import axios, { AxiosError, AxiosResponse } from 'axios';
  ${errorHandler === 'toast' ? "import { toast } from 'react-toastify';" : ''}
  
  const API_URL = '/api/${resource}';
  
  export interface ${Resource} {
    id: string;
    // Add your ${resource} properties here
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface ApiError {
    message: string;
    status?: number;
    data?: unknown;
  }
  
  ${generateErrorHandlerTS(errorHandler, Resource)}
  
  export const get${Resource}s = async (): Promise<${Resource}[]> => {
    ${generateAxiosHandlerTS('get', 'API_URL', errorHandler, Resource)}
  };
  
  export const get${Resource} = async (id: string): Promise<${Resource}> => {
    ${generateAxiosHandlerTS('get', `\`\${API_URL}/\${id}\``, errorHandler, Resource)}
  };
  
  export const create${Resource} = async (data: Omit<${Resource}, 'id'>): Promise<${Resource}> => {
    ${generateAxiosHandlerTS('post', 'API_URL', errorHandler, Resource, 'data')}
  };
  
  export const update${Resource} = async (id: string, data: Partial<${Resource}>): Promise<${Resource}> => {
    ${generateAxiosHandlerTS('put', `\`\${API_URL}/\${id}\``, errorHandler, Resource, 'data')}
  };
  
  export const delete${Resource} = async (id: string): Promise<void> => {
    ${generateAxiosHandlerTS('delete', `\`\${API_URL}/\${id}\``, errorHandler, Resource)}
  };
  `;
  }