// src/services/sdadsaService.ts
  import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
  import axios, { AxiosError } from 'axios';
  
  
  const API_URL = '/api/sdadsa';
  
  export interface Sdadsa {
    id: string;
    // Add your sdadsa properties here
  }
  
  export interface ApiError {
    message: string;
    status?: number;
  }
  
  
  function handleSdadsaError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      throw apiError;
    }
    throw new Error(`Unknown Sdadsa error: ${String(error)}`);
  }
  
  const fetchSdadsas = async (): Promise<Sdadsa[]> => {
    
    try {
      const response = await axios.get<Sdadsa>(API_URL);
      return response.data;
    } catch (error) {
      handleSdadsaError(error);
    }
  };
  
  export const useSdadsas = (options?: Omit<UseQueryOptions<Sdadsa[], ApiError>, 'queryKey' | 'queryFn'>) => {
    return useQuery<Sdadsa[], ApiError>(
      ['sdadsas'],
      fetchSdadsas,
      {
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  export const useCreateSdadsa = (options?: Omit<UseMutationOptions<Sdadsa, ApiError, Omit<Sdadsa, 'id'>>, 'mutationFn'>) => {
    const queryClient = useQueryClient();
    
    return useMutation<Sdadsa, ApiError, Omit<Sdadsa, 'id'>>(
      (data) => axios.post(API_URL, data).then(res => res.data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['sdadsas']);
        },
        onError: (error: AxiosError<ApiError>) => {
          console.error(error);
        },
        ...options
      }
    );
  };
  
  // Similar for update, delete, and getById...
  