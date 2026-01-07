import type { Status } from "@/constants/enum/statusEnum";
import { create } from "zustand";
import apiClient from "@/lib/axios";

export interface FiscalYearState {
  fiscalYears: FiscalYear[];
  isLoading: boolean;
  error: string | null;

  currentPage: number;
  totalPages: number;
  totalItems: number;

  fetchFiscalYears: (params?: { status?: Status; page?: number }) => Promise<void>;
  createFiscalYear: (year: string) => Promise<void>;
  updateFiscalYear: (id: number, year: string) => Promise<void>;
  deleteFiscalYear: (id: number) => Promise<void>;
  approveFiscalYear: (id: number) => Promise<void>;
  rejectFiscalYear: (id: number) => Promise<void>;
}

export interface FiscalYear {
  id: number;
  year: string;
  status: Status;

  created_by: number;
  created_by_name: string;

  approved_by: number | null;
  approved_by_name: string | null;

  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useFiscalStore = create<FiscalYearState>((set, get) => ({
  fiscalYears: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,

  fetchFiscalYears: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/fiscal-years/', {
        params: { 
            status: params.status,
            page: params.page
        },
      });
      
      // Handle paginated vs non-paginated response
      if (response.data.results) {
          set({ 
              fiscalYears: response.data.results,
              totalItems: response.data.count,
              // Assuming default page size of 20 as per docs, or calculated
              totalPages: Math.ceil(response.data.count / 20),
              currentPage: params.page || 1
          });
      } else {
          set({ 
              fiscalYears: response.data,
              totalItems: response.data.length,
              totalPages: 1,
              currentPage: 1
           });
      }

    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch fiscal years' });
    } finally {
      set({ isLoading: false });
    }
  },

  createFiscalYear: async (year) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/fiscal-years/', { year });
      await get().fetchFiscalYears();
    } catch (error: any) {
      // Capture specific validation error if available
      const errorMsg = error.response?.data?.detail || error.response?.data?.year?.[0] || error.message || 'Failed to create fiscal year';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateFiscalYear: async (id, year) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.patch(`/fiscal-years/${id}/`, { year });
      await get().fetchFiscalYears();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to update fiscal year';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteFiscalYear: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/fiscal-years/${id}/`);
      // Optimistic update or refetch
      // set((state) => ({
      //   fiscalYears: state.fiscalYears.filter((fy) => fy.id !== id),
      // }));
      // Refetching to handle pagination updates correctly
      await get().fetchFiscalYears({ page: get().currentPage });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete fiscal year' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  approveFiscalYear: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/fiscal-years/${id}/approve/`);
      await get().fetchFiscalYears({ page: get().currentPage });
    } catch (error: any) {
      set({ error: error.message || 'Failed to approve fiscal year' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectFiscalYear: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/fiscal-years/${id}/reject/`);
       await get().fetchFiscalYears({ page: get().currentPage });
    } catch (error: any) {
      set({ error: error.message || 'Failed to reject fiscal year' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));