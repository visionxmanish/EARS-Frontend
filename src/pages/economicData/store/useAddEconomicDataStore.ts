import apiClient from "@/lib/axios";
import { create } from "zustand";
import { type User } from "@/store/useAuthStore";
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
    dataValues: Record<string, string>;
  };
  dataCategories: DataCategory[];
  economicDataValues: Record<string, string>;
  isLoading: boolean;
  
  setStep: (step: number) => void;
  setFormData: (data: Partial<AddEconomicDataState["formData"]>) => void;
  setEconomicDataValue: (categoryId: string, value: string) => void;
  resetForm: () => void;
  fetchDataCategoriesList: () => Promise<void>;
  submitEconomicData: (user : User) => Promise<void>;
  // submit
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
      dataValues: {},
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


  submitEconomicData: async (user : User) => {
    const { formData } = get();

    set({ isLoading: true });
    try {

      const economicDataProgressPayload = {
        fiscal_year: formData.fiscalYear,
        user: user.id,
        contributors: [
          user.id
        ],
        report_type: formData.reportType,
        province: formData.province,
        district: formData.district,
        municipality : formData.localBody,
        sector: formData.sector,
        is_completed: false,

      };
      const response = await apiClient.post('/economic-data-progress/', economicDataProgressPayload);
      console.log(response.data);
      set({ economicDataValues: response.data });
    } catch (error) {
      console.error("Failed to submit economic data", error);
    } finally {
      set({ isLoading: false });
    }
  },
})
});
