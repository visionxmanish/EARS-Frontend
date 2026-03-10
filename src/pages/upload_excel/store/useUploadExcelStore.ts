import { create } from "zustand";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";

interface UploadExcelState {
  selectedFiscalYear: string;
  selectedSector: string;
  selectedReportType: string;
  selectedFile: File | null;
  
  templateSector: string;

  isUploading: boolean;
  isDownloading: boolean;

  setFiscalYear: (fiscalYear: string) => void;
  setSector: (sector: string) => void;
  setReportType: (reportType: string) => void;
  setFile: (file: File | null) => void;
  
  setTemplateSector: (sector: string) => void;

  uploadExcel: () => Promise<void>;
  downloadTemplate: () => Promise<void>;
}

export const useUploadExcelStore = create<UploadExcelState>((set, get) => ({
  selectedFiscalYear: "",
  selectedSector: "",
  selectedReportType: "",
  selectedFile: null,
  
  templateSector: "",

  isUploading: false,
  isDownloading: false,

  setFiscalYear: (fiscalYear: string) => set({ selectedFiscalYear: fiscalYear }),
  setSector: (sector: string) => set({ selectedSector: sector }),
  setReportType: (reportType: string) => set({ selectedReportType: reportType }),
  setFile: (file: File | null) => set({ selectedFile: file }),
  
  setTemplateSector: (sector: string) => set({ templateSector: sector }),

  uploadExcel: async () => {
    const { selectedFiscalYear, selectedSector, selectedReportType, selectedFile } = get();
    
    if (!selectedFiscalYear || !selectedSector || !selectedReportType || !selectedFile) {
      toast.error("Please fill all required fields and select a file");
      return;
    }

    set({ isUploading: true });
    try {
      const formData = new FormData();
      formData.append("fiscal_year_id", selectedFiscalYear);
      formData.append("sector_id", selectedSector);
      formData.append("report_type_id", selectedReportType);
      formData.append("excel_file", selectedFile);

      await apiClient.post('/reports/upload-excel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Excel file uploaded successfully");
      // Reset form on success
      set({ 
        selectedFiscalYear: "", 
        selectedSector: "", 
        selectedReportType: "", 
        selectedFile: null 
      });
    } catch (error: any) {
      console.error("Error uploading Excel:", error);
      const errorMsg = error.response?.data?.error || "Failed to upload Excel file";
      toast.error(errorMsg);
    } finally {
      set({ isUploading: false });
    }
  },

  downloadTemplate: async () => {
    const { templateSector } = get();
    
    if (!templateSector) {
      toast.error("Please select a sector to download the template");
      return;
    }

    set({ isDownloading: true });
    try {
      const response = await apiClient.get('/reports/download-template/', {
        params: {
          sector_id: templateSector
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Excel_Template_Sector_${templateSector}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Template downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading template:", error);
      const errorMsg = error.response?.data?.error || "Failed to download template";
      toast.error(errorMsg);
    } finally {
      set({ isDownloading: false });
    }
  },
}));
