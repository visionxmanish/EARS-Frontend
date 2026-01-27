import { create } from "zustand";

interface ReportState {
  fiscalYear: string;
  sector: string;
  reportLevel: string;
  fiscalYear2: string;
  sector2: string;
  reportType: string;
  reportLevel2: string;
  generateLevelReport: () => void;
  generateDifferentReport: () => void;
}

export const useReportStore = create<ReportState>((set, _) => ({
  fiscalYear: "",
  sector: "",
  reportLevel: "",
  fiscalYear2: "",
  sector2: "",
  reportType: "",
  reportLevel2: "",
  generateLevelReport: () => {
    console.log("Generate level report triggered");
  },
  generateDifferentReport: () => {
    console.log("Generate different report triggered");
  },

  setFiscalYear: (fiscalYear: string) => set({ fiscalYear }),
  setSector: (sector: string) => set({ sector }),
  setReportLevel: (reportLevel: string) => set({ reportLevel }),
  setFiscalYear2: (fiscalYear2: string) => set({ fiscalYear2 }),
  setSector2: (sector2: string) => set({ sector2 }),
  setReportType: (reportType: string) => set({ reportType }),
  setReportLevel2: (reportLevel2: string) => set({ reportLevel2 }),


}));
