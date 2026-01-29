import { create } from "zustand";

interface ReportState {
  selectedFiscalYear: string;
  selectedSector: string;
  selectedReportLevel: string;
  selectedFiscalYear2: string;
  selectedSector2: string;
  selectedReportType: string;
  selectedReportLevel2: string;
  generateLevelReport: () => void;
  generateDifferentReport: () => void;

  setFiscalYear: (fiscalYear: string) => void;
  setSector: (sector: string) => void;
  setReportLevel: (reportLevel: string) => void;
  setFiscalYear2: (fiscalYear2: string) => void;
  setSector2: (sector2: string) => void;
  setReportType: (reportType: string) => void;
  setReportLevel2: (reportLevel2: string) => void;
}

export const useReportStore = create<ReportState>((set, _) => ({
  selectedFiscalYear: "",
  selectedSector: "",
  selectedReportLevel: "",
  selectedFiscalYear2: "",
  selectedSector2: "",
  selectedReportType: "",
  selectedReportLevel2: "",
  generateLevelReport: () => {
    console.log("Generate level report triggered");
  },
  generateDifferentReport: () => {
    console.log("Generate different report triggered");
  },

  setFiscalYear: (fiscalYear: string) => set({ selectedFiscalYear: fiscalYear }),
  setSector: (sector: string) => set({ selectedSector: sector }),
  setReportLevel: (reportLevel: string) => set({ selectedReportLevel: reportLevel }),
  setFiscalYear2: (fiscalYear2: string) => set({ selectedFiscalYear2: fiscalYear2 }),
  setSector2: (sector2: string) => set({ selectedSector2: sector2 }),
  setReportType: (reportType: string) => set({ selectedReportType: reportType }),
  setReportLevel2: (reportLevel2: string) => set({ selectedReportLevel2: reportLevel2 }),


}));
