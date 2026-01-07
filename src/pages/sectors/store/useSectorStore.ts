import { Status } from "@/constants/enum/statusEnum";
import { create } from "zustand";
import apiClient from "@/lib/axios";

export interface Sector {
  id: number;
  name: string;
  description: string;
  has_different_report: boolean;
  status: Status;

  created_by: number;
  created_by_name: string;

  approved_by: number | null;
  approved_by_name: string | null;

  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SectorState {
  sectors: Sector[];
  isLoading: boolean;
  error: string | null;

  currentPage: number;
  totalPages: number;
  totalItems: number;

  fetchSectors: (params?: { status?: string; search?: string; page?: number }) => Promise<void>;
  createSector: (data: { name: string; description: string; has_different_report: boolean }) => Promise<void>;
  updateSector: (id: number, data: { name?: string; description?: string; has_different_report?: boolean }) => Promise<void>;
  deleteSector: (id: number) => Promise<void>;
  approveSector: (id: number) => Promise<void>;
  rejectSector: (id: number) => Promise<void>;
}

export const useSectorStore = create<SectorState>((set, get) => ({
  sectors: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,

  fetchSectors: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/sectors/', {
        params: { 
            status: params.status,
            search: params.search,
            page: params.page
        },
      });
      
      if (response.data.results) {
          set({ 
              sectors: response.data.results,
              totalItems: response.data.count,
              totalPages: Math.ceil(response.data.count / 20),
              currentPage: params.page || 1
          });
      } else {
          set({ 
              sectors: response.data,
              totalItems: response.data.length,
              totalPages: 1,
              currentPage: 1
           });
      }

    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch sectors' });
    } finally {
      set({ isLoading: false });
    }
  },

  createSector: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/sectors/', data);
      await get().fetchSectors();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to create sector';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateSector: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.patch(`/sectors/${id}/`, data);
      await get().fetchSectors();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to update sector';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSector: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/sectors/${id}/`);
      await get().fetchSectors({ page: get().currentPage });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete sector' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  approveSector: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/sectors/${id}/approve/`);
      await get().fetchSectors({ page: get().currentPage });
    } catch (error: any) {
      set({ error: error.message || 'Failed to approve sector' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectSector: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/sectors/${id}/reject/`);
       await get().fetchSectors({ page: get().currentPage });
    } catch (error: any) {
      set({ error: error.message || 'Failed to reject sector' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
