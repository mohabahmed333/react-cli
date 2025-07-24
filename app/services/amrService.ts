// src/services/amrService.ts
  import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
  import axios, { AxiosError } from 'axios';
  
  
  const API_URL = '/api/amr';
  
  export interface Amr {
    id: string;
    // Add your amr properties here
  }
  
  export interface ApiError {
    message: string;
    status?: number;
  }
  
  
  function handleAmrError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      throw apiError;
    }
    throw new Error(`Unknown Amr error: ${String(error)}`);
  }
  
  const fetchAmrs = async (): Promise<Amr[]> => {
    
    try {
      const response = await axios.get<Amr>(API_URL);
      return response.data;
    } catch (error) {
      handleAmrError(error);
    }
  };
  
  export const useAmrs = (options?: Omit<UseQueryOptions<Amr[], ApiError>, 'queryKey' | 'queryFn'>) => {
    return useQuery<Amr[], ApiError>(
      ['amrs'],
      fetchAmrs,
      {
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  export const useCreateAmr = (options?: Omit<UseMutationOptions<Amr, ApiError, Omit<Amr, 'id'>>, 'mutationFn'>) => {
    const queryClient = useQueryClient();
    
    return useMutation<Amr, ApiError, Omit<Amr, 'id'>>(
      (data) => axios.post(API_URL, data).then(res => res.data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['amrs']);
        },
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  // Similar for update, delete, and getById...
  