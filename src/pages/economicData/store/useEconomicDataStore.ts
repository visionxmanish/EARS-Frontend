import apiClient from "@/lib/axios";
import { create } from "zustand";
import { Status } from "@/constants/enum/statusEnum";

export interface DataCategory {
  id: number;
  name: string;
  related_office: number;
  unit?: string;
  parent?: number | null;
}

export interface EconomicDataProgress {
  id: number;
  fiscal_year: number; 
  fiscal_year_name?: string;
  province: number;
  province_name?: string;
  district: number;
  district_name?: string;
  municipality: number;
  municipality_name?: string;
  sector: number;
  sector_name?: string;
  report_type: number;
  report_type_name?: string;
  is_completed: boolean;
  status: Status;
  created_by: number;
  created_by_name: string;
  approved_by?: number | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface EconomicDataState {
  step: number;
  formData: {
    fiscalYear: string;
    reportType: string;
    province: string;
    district: string;
    localBody: string;
    sector: string;
    dataValues: Record<string, string>;
  };
  dataCategories: DataCategory[];
  economicDataValues: Record<string, string>;
  isLoading: boolean;
  
  setStep: (step: number) => void;
  setFormData: (data: Partial<EconomicDataState["formData"]>) => void;
  setEconomicDataValue: (categoryId: string, value: string) => void;
  resetForm: () => void;
  fetchDataCategoriesList: () => Promise<void>;

  // Management State
  progressList: EconomicDataProgress[];
  isLoadingList: boolean;
  errorList: string | null;
  
  // Pagination State
  currentPage: number;
  totalPages: number;
  totalItems: number;

  // View Details State
  selectedProgressEntries: any[]; // Or define interface
  isLoadingEntries: boolean;

  fetchProgressList: (params?: { page?: number; status?: string; search?: string }) => Promise<void>;
  fetchProgressEntries: (progressId: number) => Promise<void>;
  approveProgress: (id: number) => Promise<void>;
  rejectProgress: (id: number) => Promise<void>;
  deleteProgress: (id: number) => Promise<void>;
}

export const useEconomicDataStore = create<EconomicDataState>((set, get) => {
  return ({
    step: 1,
    formData: {
      fiscalYear: "",
      reportType: "",
      province: "",
      district: "",
      localBody: "",
      sector: "",
      dataValues: {},
    },
    dataCategories: [],
    economicDataValues: {},
    isLoading: false,

    progressList: [],
    isLoadingList: false,
    errorList: null,

    currentPage: 1,
    totalPages: 1,
    totalItems: 0,

    selectedProgressEntries: [],
    isLoadingEntries: false,

    fetchDataCategoriesList: async () => {
      const { formData } = get();
      if (!formData.sector) return;
      
      set({ isLoading: true });
      try {
        const response = await apiClient.get('/data-categories/', {
          params: { sector: formData.sector, ordering: 'id' }
        });
        console.log(response.data);
        set({ dataCategories: response.data.results || response.data });
      } catch (error) {
        console.error("Failed to fetch data categories", error);
      } finally {
        set({ isLoading: false });
      }
    },

    setStep: (step) => set({ step }),

    setFormData: (data) => set((state) => ({
      formData: { ...state.formData, ...data },
    })),

    setEconomicDataValue: (categoryId, value) => set((state) => ({
      economicDataValues: { ...state.economicDataValues, [categoryId]: value },
      formData: { ...state.formData, dataValues: { ...state.formData.dataValues, [categoryId]: value } },
    })),
    

    resetForm: () => set({
      step: 1,
      formData: {
        fiscalYear: "",
        reportType: "",
        province: "",
        district: "",
        localBody: "",
        sector: "",
        dataValues: {},
      },
      dataCategories: [],
      economicDataValues: {},
    }),

    fetchProgressList: async (params = {}) => {
        set({ isLoadingList: true, errorList: null });
        try {
            const response = await apiClient.get('/economic-data-progress/', { params });
            if (response.data.results) {
                 set({ 
                    progressList: response.data.results,
                    totalItems: response.data.count,
                    totalPages: Math.ceil(response.data.count / 20), // Assuming default page size 20
                    currentPage: params.page || 1
                });
            } else {
                 set({ 
                    progressList: response.data,
                    totalItems: response.data.length,
                    totalPages: 1,
                    currentPage: 1
                });
            }
        } catch (error: any) {
            set({ errorList: error.message || "Failed to fetch progress list" });
        } finally {
            set({ isLoadingList: false });
        }
    },

    fetchProgressEntries: async (progressId) => {
        set({ isLoadingEntries: true });
        try {
            const response = await apiClient.get(`/economic-data-entries/?progress=${progressId}`);
            set({ selectedProgressEntries: response.data.results || response.data });
        } catch (error) {
            console.error("Failed to fetch entries", error);
        } finally {
            set({ isLoadingEntries: false });
        }
    },

    approveProgress: async (id) => {
        set({ isLoadingList: true });
        try {
            await apiClient.post(`/economic-data-progress/${id}/approve/`);
            set(state => ({
                progressList: state.progressList.map(item => 
                    item.id === id ? { ...item, status: Status.APPROVED } : item
                )
            }));
        } catch (error: any) {
            set({ errorList: error.message || "Failed to approve" });
            throw error;
        } finally {
            set({ isLoadingList: false });
        }
    },

    rejectProgress: async (id) => {
         set({ isLoadingList: true });
        try {
            await apiClient.post(`/economic-data-progress/${id}/reject/`);
             set(state => ({
                progressList: state.progressList.map(item => 
                    item.id === id ? { ...item, status: Status.REJECTED } : item
                )
            }));
        } catch (error: any) {
            set({ errorList: error.message || "Failed to reject" });
             throw error;
        } finally {
            set({ isLoadingList: false });
        }
    },

    deleteProgress: async (id) => {
        set({ isLoadingList: true });
        try {
            await apiClient.delete(`/economic-data-progress/${id}/`);
            set(state => ({
                progressList: state.progressList.filter(item => item.id !== id)
            }));
        } catch (error: any) {
             set({ errorList: error.message || "Failed to delete" });
             throw error;
        } finally {
            set({ isLoadingList: false });
        }
    },
  });
});
