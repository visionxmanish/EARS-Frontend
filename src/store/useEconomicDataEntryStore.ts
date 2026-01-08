import { create } from "zustand";
import apiClient from "@/lib/axios";
import { Status } from "@/constants/enum/statusEnum";

export interface EconomicDataEntry {
  id: number;
  progress: number;
  category: number;
  value: number;
  capacity?: number;
  status: Status;
  created_at: string;
  updated_at: string;
  category_name?: string; // Optional helper
  created_by?: number;
  created_by_name?: string;
}

export interface CreateEntryPayload {
  progress: number;
  category: number;
  value: number;
  capacity?: number;
}

export interface UpdateEntryPayload {
  value?: number;
  capacity?: number;
}

export interface RejectEntryPayload {
    rejected_reason: string;
}

interface EconomicDataEntryState {
  entries: EconomicDataEntry[];
  isLoading: boolean;
  error: string | null;

  fetchEntries: (progressId: number, params?: { status?: string }) => Promise<void>;
  createEntry: (data: CreateEntryPayload) => Promise<void>;
  updateEntry: (id: number, data: UpdateEntryPayload) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  approveEntry: (id: number) => Promise<void>;
  rejectEntry: (id: number, data: RejectEntryPayload) => Promise<void>;
}

export const useEconomicDataEntryStore = create<EconomicDataEntryState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchEntries: async (progressId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/economic-data-entries/', {
        params: { 
            progress: progressId,
            ...params 
        },
      });
      // Assuming pagination is standard but for entries we usually want all for a specific progress ID, 
      // or we handle pagination. For now, assuming standard response format.
      // If the API returns paginated results for entries, we might need to handle it. 
      // Usually entries lists are smaller per progress, but let's handle the 'results' wrapper if present.
      const data = response.data.results ? response.data.results : response.data;
      set({ entries: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch entries' });
    } finally {
      set({ isLoading: false });
    }
  },

  createEntry: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/economic-data-entries/', data);
      // Refresh entries for the same progress
      await get().fetchEntries(data.progress);
    } catch (error: any) {
      set({ error: error.response?.data?.detail || error.message || 'Failed to create entry' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEntry: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.patch(`/economic-data-entries/${id}/`, data);
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? { ...e, ...data } : e)),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.detail || error.message || 'Failed to update entry' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/economic-data-entries/${id}/`);
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete entry' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  approveEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/economic-data-entries/${id}/approve/`);
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? { ...e, status: Status.APPROVED } : e)),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to approve entry' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectEntry: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/economic-data-entries/${id}/reject/`, data);
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? { ...e, status: Status.REJECTED } : e)),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to reject entry' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
