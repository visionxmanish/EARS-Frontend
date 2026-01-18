import { create } from "zustand";
import apiClient from "@/lib/axios";

export interface ReportType {
  id: number;
  name: string;
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

export interface CurrentUserData {
  id: number;
  staff_code: string;
  username: string | null;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  gender: string;
  profile_picture: string;
  user_related_offices: number[];
  user_provinces: number[];
  user_districts: number[];
  user_municipalities: number[];
  created_at: string;
  updated_at: string;
}

interface CommonDataState {
  reportTypes: ReportType[];
  provinces: Province[];
  districts: District[];
  municipalities: Municipality[];
  isLoading: boolean;
  error: string | null;
  currentUserData: CurrentUserData | null;

  fetchReportTypes: () => Promise<void>;
  fetchProvinces: () => Promise<void>;
  fetchDistricts: (provinceId: number) => Promise<void>;
  fetchMunicipalities: (districtId: number) => Promise<void>;
  fetchCurrentUserData: () => Promise<void>;
  
  getAccessibleProvinces: () => Province[];
  getAccessibleDistricts: () => District[];
  getAccessibleMunicipalities: () => Municipality[];
}

export const useCommonDataStore = create<CommonDataState>((set, get) => ({
  reportTypes: [],
  provinces: [],
  districts: [],
  municipalities: [],
  isLoading: false,
  error: null,
  currentUserData: null,

  fetchCurrentUserData: async () => {
    try {
      const response = await apiClient.get('users/me/');
      console.log(response.data);
      set({ currentUserData: response.data });
    } catch (error: any) {
      console.error("Failed to fetch current user data", error);
    }
  },

  getAccessibleProvinces: () => {
    const { provinces, currentUserData } = get();
    return provinces.filter(p => 
        !currentUserData || 
        !currentUserData.user_provinces?.length || 
        currentUserData.user_provinces.includes(p.id)
    );
  },

  getAccessibleDistricts: () => {
    const { districts, currentUserData } = get();
    return districts.filter(d => 
        !currentUserData || 
        !currentUserData.user_districts?.length || 
        currentUserData.user_districts.includes(d.id)
    );
  },

  getAccessibleMunicipalities: () => {
    const { municipalities, currentUserData } = get();
    return municipalities.filter(m => 
        !currentUserData || 
        !currentUserData.user_municipalities?.length || 
        currentUserData.user_municipalities.includes(m.id)
    );
  },

  fetchReportTypes: async () => {

    try {
      const response = await apiClient.get('/report-types/');
      set({ reportTypes: response.data.results });
    } catch (error: any) {
      console.error("Failed to fetch report types", error);
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
