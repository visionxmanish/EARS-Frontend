import apiClient from "@/lib/axios";
import { create } from "zustand";

export interface DataCategory {
  id: number;
  name: string;
  related_office: number;
  unit?: string;
  parent?: number | null;
}

interface AddEconomicDataState {
  step: number;
  formData: {
    fiscalYear: string;
    reportType: string;
    province: string;
    district: string;
    localBody: string;
    sector: string;
  };
  dataCategories: DataCategory[];
  economicDataValues: Record<string, string>;
  isLoading: boolean;
  
  setStep: (step: number) => void;
  setFormData: (data: Partial<AddEconomicDataState["formData"]>) => void;
  setEconomicDataValue: (categoryId: string, value: string) => void;
  resetForm: () => void;
  fetchDataCategoriesList: () => Promise<void>;
}

export const useAddEconomicDataStore = create<AddEconomicDataState>((set, get) => {
  return ({
    step: 1,
    formData: {
      fiscalYear: "",
      reportType: "",
      province: "",
      district: "",
      localBody: "",
      sector: "",
    },
    dataCategories: [],
    economicDataValues: {},
    isLoading: false,

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
      economicDataValues: { ...state.economicDataValues, [categoryId]: value }
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
      },
      dataCategories: [],
      economicDataValues: {},
    }),
  });
});
