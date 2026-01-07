import { Status } from "@/constants/enum/statusEnum";
import { create } from "zustand";
import apiClient from "@/lib/axios";

export interface DataCategory {
  id: number;
  sector: number;
  name: string;
  parent: number | null;
  unit: string;
  is_summable: boolean;
  related_office: number | null; 
  // remarks: string | null; 
  status: Status;

  parent_name: string | null;
  sector_name: string;
  related_office_name?: string | null; 

  created_by: number;
  created_by_name: string;

  approved_by: number | null;
  approved_by_name: string | null;

  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // keeping remarks in interface if backend still sends it, but strictly removing from UI usage as requested. 
  // Actually, let's keep it in interface for type safety if API returns it, but we won't send it.
  remarks: string | null; 
}

export interface DataCategoryQueryParams {
  sector?: number | string;
  status?: string;
  search?: string;
  page?: number;
}

export interface CreateDataCategoryPayload {
  sector: number;
  name: string;
  parent?: number | null | string;
  unit: string;
  is_summable: boolean;
  related_office?: number | null | string;
  status?: Status;
}

export interface UpdateDataCategoryPayload {
  name?: string;
  parent?: number | null | string;
  unit?: string;
  is_summable?: boolean;
  related_office?: number | null | string;
}

export interface DataCategoryState {
  categories: DataCategory[];
  isLoading: boolean;
  error: string | null;

  currentPage: number;
  totalPages: number;
  totalItems: number;

  fetchDataCategories: (params?: DataCategoryQueryParams) => Promise<void>;
  createDataCategory: (data: CreateDataCategoryPayload) => Promise<void>;
  updateDataCategory: (id: number, data: UpdateDataCategoryPayload) => Promise<void>;
  deleteDataCategory: (id: number) => Promise<void>;
  approveDataCategory: (id: number) => Promise<void>;
  rejectDataCategory: (id: number) => Promise<void>;
}

export const useDataCategoryStore = create<DataCategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,

  fetchDataCategories: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/data-categories/', {
        params: { 
            sector: params.sector,
            status: params.status,
            search: params.search,
            page: params.page
        },
      });
      
      if (response.data.results) {
          set({ 
              categories: response.data.results,
              totalItems: response.data.count,
              totalPages: Math.ceil(response.data.count / 20),
              currentPage: params.page || 1
          });
      } else {
          set({ 
              categories: response.data,
              totalItems: response.data.length,
              totalPages: 1,
              currentPage: 1
           });
      }

    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch data categories' });
    } finally {
      set({ isLoading: false });
    }
  },

  createDataCategory: async (data) => {
    console.log(data);
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/data-categories/', data);
      await get().fetchDataCategories({ sector: data.sector }); 
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to create data category';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateDataCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.patch(`/data-categories/${id}/`, data);
      
      // Normalize data for local state (convert empty strings to null)
      const normalizedData = { ...data };
      if (typeof normalizedData.parent === 'string') normalizedData.parent = null;
      if (typeof normalizedData.related_office === 'string') normalizedData.related_office = null;

      set((state) => ({
        categories: state.categories.map((c) =>
             c.id === id ? { ...c, ...normalizedData } as DataCategory : c
        )
      }));
      // Optionally we could refetch strictly, but optimistic update or shallow update is fine for now
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to update data category';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDataCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/data-categories/${id}/`);
      set((state) => ({
          categories: state.categories.filter((c) => c.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete data category' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  approveDataCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/data-categories/${id}/approve/`);
      set((state) => ({
        categories: state.categories.map((c) => 
            c.id === id ? { ...c, status: Status.APPROVED } : c
        ),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to approve category' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectDataCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/data-categories/${id}/reject/`);
       set((state) => ({
        categories: state.categories.map((c) => 
            c.id === id ? { ...c, status: Status.REJECTED } : c
        ),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to reject category' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
