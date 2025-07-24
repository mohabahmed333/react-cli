// src/services/MahmoudService.ts
  import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
  import axios, { AxiosError } from 'axios';
  
  
  const API_URL = '/api/Mahmoud';
  
  export interface Mahmoud {
    id: string;
    // Add your Mahmoud properties here
  }
  
  export interface ApiError {
    message: string;
    status?: number;
  }
  
  
  function handleMahmoudError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      throw apiError;
    }
    throw new Error(`Unknown Mahmoud error: ${String(error)}`);
  }
  
  const fetchMahmouds = async (): Promise<Mahmoud[]> => {
    
    try {
      const response = await axios.get<Mahmoud>(API_URL);
      return response.data;
    } catch (error) {
      handleMahmoudError(error);
    }
  };
  
  export const useMahmouds = (options?: Omit<UseQueryOptions<Mahmoud[], ApiError>, 'queryKey' | 'queryFn'>) => {
    return useQuery<Mahmoud[], ApiError>(
      ['Mahmouds'],
      fetchMahmouds,
      {
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  export const useCreateMahmoud = (options?: Omit<UseMutationOptions<Mahmoud, ApiError, Omit<Mahmoud, 'id'>>, 'mutationFn'>) => {
    const queryClient = useQueryClient();
    
    return useMutation<Mahmoud, ApiError, Omit<Mahmoud, 'id'>>(
      (data) => axios.post(API_URL, data).then(res => res.data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['Mahmouds']);
        },
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  // Similar for update, delete, and getById...
  