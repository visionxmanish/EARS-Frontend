import { create } from "zustand";

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
  setStep: (step: number) => void;
  setFormData: (data: Partial<AddEconomicDataState["formData"]>) => void;
  resetForm: () => void;
}

export const useAddEconomicDataStore = create<AddEconomicDataState>((set) => ({
  step: 1,
  formData: {
    fiscalYear: "",
    reportType: "",
    province: "",
    district: "",
    localBody: "",
    sector: "",
  },
  setStep: (step) => set({ step }),
  
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),


    
  resetForm: () =>
    set({
      step: 1,
      formData: {
        fiscalYear: "",
        reportType: "",
        province: "",
        district: "",
        localBody: "",
        sector: "",
      },
    }),
}));
