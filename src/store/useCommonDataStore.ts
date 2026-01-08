import { create } from "zustand";
import apiClient from "@/lib/axios";

export interface ReportType {
  id: number;
  type_name: string;
}

export interface Province {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  province: number;
}

export interface Municipality {
  id: number;
  name: string;
  district: number;
  type: string;
}

interface CommonDataState {
  reportTypes: ReportType[];
  provinces: Province[];
  districts: District[];
  municipalities: Municipality[];
  isLoading: boolean;
  error: string | null;

  fetchReportTypes: () => Promise<void>;
  fetchProvinces: () => Promise<void>;
  fetchDistricts: (provinceId: number) => Promise<void>;
  fetchMunicipalities: (districtId: number) => Promise<void>;
}

export const useCommonDataStore = create<CommonDataState>((set) => ({
  reportTypes: [],
  provinces: [],
  districts: [],
  municipalities: [],
  isLoading: false,
  error: null,

  fetchReportTypes: async () => {
    // set({ isLoading: true, error: null }); // Optional: don't always trigger global loading for dropdowns
    try {
      const response = await apiClient.get('/report-types/');
      set({ reportTypes: response.data.results || response.data });
    } catch (error: any) {
      console.error("Failed to fetch report types", error);
      // set({ error: error.message });
    }
  },

  fetchProvinces: async () => {
    try {
      const response = await apiClient.get('/provinces/');
      set({ provinces: response.data.results || response.data });
    } catch (error: any) {
      console.error("Failed to fetch provinces", error);
    }
  },

  fetchDistricts: async (provinceId) => {
    try {
      const response = await apiClient.get('/districts/', { params: { province: provinceId } });
      set({ districts: response.data.results || response.data });
    } catch (error: any) {
      console.error("Failed to fetch districts", error);
    }
  },

  fetchMunicipalities: async (districtId) => {
     try {
      const response = await apiClient.get('/municipalities/', { params: { district: districtId } });
      set({ municipalities: response.data.results || response.data });
    } catch (error: any) {
      console.error("Failed to fetch municipalities", error);
    }
  }
}));
