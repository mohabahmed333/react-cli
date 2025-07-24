import { AxiosCrudTemplateParams } from "./generateAxios";
import { generateAxiosHandlerTS, generateErrorHandlerTS } from "./generateErrorHandling";

 export function generateReactQueryCrudTS({ resource, Resource, errorHandler }: AxiosCrudTemplateParams): string {
    return `// src/services/${resource}Service.ts
  import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
  import axios, { AxiosError } from 'axios';
  ${errorHandler === 'toast' ? "import { toast } from 'react-toastify';" : ''}
  
  const API_URL = '/api/${resource}';
  
  export interface ${Resource} {
    id: string;
    // Add your ${resource} properties here
  }
  
  export interface ApiError {
    message: string;
    status?: number;
  }
  
  ${generateErrorHandlerTS(errorHandler, Resource)}
  
  const fetch${Resource}s = async (): Promise<${Resource}[]> => {
    ${generateAxiosHandlerTS('get', 'API_URL', errorHandler, Resource)}
  };
  
  export const use${Resource}s = (options?: Omit<UseQueryOptions<${Resource}[], ApiError>, 'queryKey' | 'queryFn'>) => {
    return useQuery<${Resource}[], ApiError>(
      ['${resource}s'],
      fetch${Resource}s,
      {
        onError: (error: AxiosError<ApiError>) => {
          ${errorHandler === 'toast' ? 'toast.error(error.response?.data?.message || error.message);' : 'console.error(error);'}
        },
        ...options
      }
    );
  };
  
  export const useCreate${Resource} = (options?: Omit<UseMutationOptions<${Resource}, ApiError, Omit<${Resource}, 'id'>>, 'mutationFn'>) => {
    const queryClient = useQueryClient();
    
    return useMutation<${Resource}, ApiError, Omit<${Resource}, 'id'>>(
      (data) => axios.post(API_URL, data).then(res => res.data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['${resource}s']);
        },
        onError: (error: AxiosError<ApiError>) => {
          ${errorHandler === 'toast' ? 'toast.error(error.response?.data?.message || error.message);' : 'console.error(error);'}
        },
        ...options
      }
    );
  };
  
  // Similar for update, delete, and getById...
  `;
  }