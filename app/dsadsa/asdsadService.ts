// src/services/asdsadService.ts
  import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
  import axios, { AxiosError } from 'axios';
  
  
  const API_URL = '/api/asdsad';
  
  export interface Asdsad {
    id: string;
    // Add your asdsad properties here
  }
  
  export interface ApiError {
    message: string;
    status?: number;
  }
  
  
  function handleAsdsadError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      throw apiError;
    }
    throw new Error(`Unknown Asdsad error: ${String(error)}`);
  }
  
  const fetchAsdsads = async (): Promise<Asdsad[]> => {
    
    try {
      const response = await axios.get<Asdsad>(API_URL);
      return response.data;
    } catch (error) {
      handleAsdsadError(error);
    }
  };
  
  export const useAsdsads = (options?: Omit<UseQueryOptions<Asdsad[], ApiError>, 'queryKey' | 'queryFn'>) => {
    return useQuery<Asdsad[], ApiError>(
      ['asdsads'],
      fetchAsdsads,
      {
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  export const useCreateAsdsad = (options?: Omit<UseMutationOptions<Asdsad, ApiError, Omit<Asdsad, 'id'>>, 'mutationFn'>) => {
    const queryClient = useQueryClient();
    
    return useMutation<Asdsad, ApiError, Omit<Asdsad, 'id'>>(
      (data) => axios.post(API_URL, data).then(res => res.data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['asdsads']);
        },
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  // Similar for update, delete, and getById...
  