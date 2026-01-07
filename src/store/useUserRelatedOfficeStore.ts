import { Status } from "@/constants/enum/statusEnum";
import { create } from "zustand";
import apiClient from "@/lib/axios";

export interface UserRelatedOffice {
  id: number;
  office: string; 
  status: Status;
  created_at: string;
  updated_at: string;
  created_by?: number;
  created_by_name?: string;
  approved_by?: number;
  approved_by_name?: string;
}

export interface UserRelatedOfficeState {
  offices: UserRelatedOffice[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;

  fetchUserRelatedOffices: (params?: { status?: string; search?: string; page?: number }) => Promise<void>;
  createOffice: (data: { office: string }) => Promise<void>;
  updateOffice: (id: number, data: { office: string }) => Promise<void>;
  deleteOffice: (id: number) => Promise<void>;
  approveOffice: (id: number) => Promise<void>;
  rejectOffice: (id: number) => Promise<void>;
}

export const useUserRelatedOfficeStore = create<UserRelatedOfficeState>((set, get) => ({
  offices: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,

  fetchUserRelatedOffices: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/user-related-offices/', {
        params: {
          status: params.status,
          search: params.search,
          page: params.page
        },
      });

      if (response.data.results) {
        set({ 
            offices: response.data.results,
            totalItems: response.data.count,
            totalPages: Math.ceil(response.data.count / 20),
            currentPage: params.page || 1
        });
      } else {
        set({ 
            offices: response.data,
            totalItems: response.data.length,
            totalPages: 1,
            currentPage: 1
         });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch user related offices' });
    } finally {
      set({ isLoading: false });
    }
  },

  createOffice: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/user-related-offices/', data);
      await get().fetchUserRelatedOffices(); 
    } catch (error: any) {
      set({ error: error.response?.data?.detail || error.message || 'Failed to create office' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateOffice: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.patch(`/user-related-offices/${id}/`, data);
      set((state) => ({
        offices: state.offices.map((o) =>
             o.id === id ? { ...o, ...data } : o
        )
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.detail || error.message || 'Failed to update office' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteOffice: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/user-related-offices/${id}/`);
      set((state) => ({
          offices: state.offices.filter((o) => o.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete office' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  approveOffice: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/user-related-offices/${id}/approve/`);
      set((state) => ({
        offices: state.offices.map((o) => 
            o.id === id ? { ...o, status: Status.APPROVED } : o
        ),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to approve office' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectOffice: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/user-related-offices/${id}/reject/`);
       set((state) => ({
        offices: state.offices.map((o) => 
            o.id === id ? { ...o, status: Status.REJECTED } : o
        ),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to reject office' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
