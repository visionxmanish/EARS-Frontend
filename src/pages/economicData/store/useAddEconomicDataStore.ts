import apiClient from "@/lib/axios";
import { create } from "zustand";
import { type User } from "@/store/useAuthStore";
import { API_ENDPOINTS } from "@/constants/api_constants";


type EconomicDataValue = {
  category: number;
  value: number;
} 

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
  submitEconomicDataValues: (economicDataValues : Record<string, string>) => Promise<void>;
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

submitEconomicData: async (user: User) => {
  const { formData, economicDataValues } = get();
  set({ isLoading: true });

  try {
    // Transform Record<string, string> into array of { category, value }
    const economicDataEntries: EconomicDataValue[] = Object.entries(economicDataValues)
      .filter(([_, value]) => value !== "" && !isNaN(Number(value))) // avoid empty or invalid entries
      .map(([key, value]) => ({
        category: parseInt(key),
        value: parseFloat(value),
      }));

    // Construct payload matching backend format
    const economicDataProgressPayload = {
      user: user.id,
      fiscal_year: formData.fiscalYear,
      contributors: [user.id],
      report_type: formData.reportType,
      province: formData.province,
      district: formData.district,
      municipality: formData.localBody,
      sector: formData.sector,
      is_completed: false,
      economic_entries: economicDataEntries,
    };



    // Make API call
    const response = await apiClient.post(
      API_ENDPOINTS.ECONOMIC_DATA_PROGRESS,
      economicDataProgressPayload
    );

    console.log("✅ Economic Data Submitted Successfully");
    console.log(response.data);
  } catch (error: any) {
    console.error("Failed to submit economic data:", error.response?.data || error.message);
  } finally {
    set({ isLoading: false });
  }
},



  submitEconomicDataValues: async (economicDataValues : Record<string, string>) => {
    console.log(economicDataValues);
  
  },
})
});
