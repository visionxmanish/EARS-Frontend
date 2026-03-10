import { create } from "zustand";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";

interface ReportState {
  selectedFiscalYear: string;
  selectedSector: string;
  selectedReportLevel: string;
  selectedFiscalYear2: string;
  selectedSector2: string;
  selectedReportType: string;
  selectedReportLevel2: string;
  
  isLoadingLevelReport: boolean;
  isLoadingDifferentReport: boolean;

  generateLevelReport: () => Promise<void>;
  generateDifferentReport: () => Promise<void>;

  setFiscalYear: (fiscalYear: string) => void;
  setSector: (sector: string) => void;
  setReportLevel: (reportLevel: string) => void;
  setFiscalYear2: (fiscalYear2: string) => void;
  setSector2: (sector2: string) => void;
  setReportType: (reportType: string) => void;
  setReportLevel2: (reportLevel2: string) => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  selectedFiscalYear: "",
  selectedSector: "",
  selectedReportLevel: "",
  selectedFiscalYear2: "",
  selectedSector2: "",
  selectedReportType: "",
  selectedReportLevel2: "",
  
  isLoadingLevelReport: false,
  isLoadingDifferentReport: false,

  generateLevelReport: async () => {
    const { selectedFiscalYear, selectedSector, selectedReportLevel } = get();
    
    if (!selectedFiscalYear || !selectedSector || !selectedReportLevel) {
      toast.error("Please select all fields for the Level Report");
      return;
    }

    set({ isLoadingLevelReport: true });
    try {
      const response = await apiClient.post('/reports/level/', {
        fiscal_year_id: parseInt(selectedFiscalYear),
        sector_id: parseInt(selectedSector),
        level: selectedReportLevel
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Level_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Level Report generated successfully");
    } catch (error: any) {
       console.error("Error generating level report:", error);
       const errorMsg = error.response?.data?.error || "Failed to generate Level Report";
       toast.error(errorMsg);
    } finally {
      set({ isLoadingLevelReport: false });
    }
  },
  
  generateDifferentReport: async () => {
    const { selectedFiscalYear2, selectedSector2, selectedReportType, selectedReportLevel2 } = get();
    
    if (!selectedFiscalYear2 || !selectedSector2 || !selectedReportType || !selectedReportLevel2) {
      toast.error("Please select all fields for the Different Report");
      return;
    }

    set({ isLoadingDifferentReport: true });
    try {
      const response = await apiClient.post('/reports/different/', {
        fiscal_year_id: parseInt(selectedFiscalYear2),
        sector_id: parseInt(selectedSector2),
        report_type_id: parseInt(selectedReportType),
        level: selectedReportLevel2
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Different_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Different Report generated successfully");
    } catch (error: any) {
       console.error("Error generating different report:", error);
       const errorMsg = error.response?.data?.error || "Failed to generate Different Report";
       toast.error(errorMsg);
    } finally {
      set({ isLoadingDifferentReport: false });
    }
  },

  setFiscalYear: (fiscalYear: string) => set({ selectedFiscalYear: fiscalYear }),
  setSector: (sector: string) => set({ selectedSector: sector }),
  setReportLevel: (reportLevel: string) => set({ selectedReportLevel: reportLevel }),
  setFiscalYear2: (fiscalYear2: string) => set({ selectedFiscalYear2: fiscalYear2 }),
  setSector2: (sector2: string) => set({ selectedSector2: sector2 }),
  setReportType: (reportType: string) => set({ selectedReportType: reportType }),
  setReportLevel2: (reportLevel2: string) => set({ selectedReportLevel2: reportLevel2 }),
}));
