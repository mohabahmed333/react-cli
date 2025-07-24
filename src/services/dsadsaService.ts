// src/services/dsadsaService.ts
  import axios, { AxiosError, AxiosResponse } from 'axios';
  
  
  const API_URL = '/api/dsadsa';
  
  export interface Dsadsa {
    id: string;
    // Add your dsadsa properties here
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface ApiError {
    message: string;
    status?: number;
    data?: unknown;
  }
  
  
  function handleDsadsaError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      throw apiError;
    }
    throw new Error(`Unknown Dsadsa error: ${String(error)}`);
  }
  
  export const getDsadsas = async (): Promise<Dsadsa[]> => {
    
    try {
      const response = await axios.get<Dsadsa[]>(API_URL);
      return response.data;
    } catch (error) {
      handleDsadsaError(error);
    }
  };
  
  export const getDsadsa = async (id: string): Promise<Dsadsa> => {
    
    try {
      const response = await axios.get<Dsadsa>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      handleDsadsaError(error);
    }
  };
  
  export const createDsadsa = async (data: Omit<Dsadsa, 'id'>): Promise<Dsadsa> => {
    
    try {
      const response = await axios.post<Dsadsa>(API_URL, data);
      return response.data;
    } catch (error) {
      handleDsadsaError(error);
    }
  };
  
  export const updateDsadsa = async (id: string, data: Partial<Dsadsa>): Promise<Dsadsa> => {
    
    try {
      const response = await axios.put<Dsadsa>(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      handleDsadsaError(error);
    }
  };
  
  export const deleteDsadsa = async (id: string): Promise<void> => {
    
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      handleDsadsaError(error);
    }
  };
  