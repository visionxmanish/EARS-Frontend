import { useEffect } from "react";
import { useFiscalStore } from "@/pages/fiscal_year/store/useFiscalStore";
import { useSectorStore } from "@/pages/sectors/store/useSectorStore";
import { useCommonDataStore } from "@/store/useCommonDataStore";
import { useUploadExcelStore } from "./store/useUploadExcelStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Loader2, FileUp, FileDown } from "lucide-react";

export default function UploadExcel() {
  const { fiscalYears, fetchFiscalYears } = useFiscalStore();
  const { sectors, fetchSectors } = useSectorStore();
  const { reportTypes, fetchReportTypes } = useCommonDataStore();

  const {
    selectedFiscalYear,
    selectedSector,
    selectedReportType,
    selectedFile,
    templateSector,
    isUploading,
    isDownloading,
    setFiscalYear,
    setSector,
    setReportType,
    setFile,
    setTemplateSector,
    uploadExcel,
    downloadTemplate,
  } = useUploadExcelStore();

  useEffect(() => {
    fetchFiscalYears();
    fetchSectors();
    fetchReportTypes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Excel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="text-primary hover:underline cursor-pointer">Dashboard</span> / Upload Excel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Upload Excel Card */}
        <Card className="shadow-sm bg-white border-none">
          <CardHeader className="pb-4 border-b border-gray-200">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-slate-700">
              <FileUp className="h-5 w-5" />
              Upload Excel File
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 text-sm">Fiscal Year</Label>
                <Select value={selectedFiscalYear} onValueChange={setFiscalYear}>
                  <SelectTrigger className="bg-white w-full border-gray-300">
                    <SelectValue placeholder="Select Fiscal Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {fiscalYears.map((fy) => (
                      <SelectItem key={fy.id} value={fy.id.toString()} className="hover:bg-gray-100">
                        {fy.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 text-sm">Sector</Label>
                <Select value={selectedSector} onValueChange={setSector}>
                  <SelectTrigger className="bg-white w-full border-gray-300">
                    <SelectValue placeholder="Select Sector" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id.toString()} className="hover:bg-gray-100">
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 text-sm">Report Type</Label>
                <Select value={selectedReportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-white w-full border-gray-300">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {reportTypes.map((rt) => (
                      <SelectItem key={rt.id} value={rt.id.toString()} className="hover:bg-gray-100">
                        {rt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 text-sm">Select Excel File</Label>
                <div className="flex items-center gap-0 w-full border border-gray-300 rounded-md overflow-hidden bg-white">
                    <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 border-r border-gray-300 text-sm font-medium text-gray-700 min-w-max">
                        Choose file
                        <input 
                          type="file" 
                          accept=".xlsx, .xls"
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                    </label>
                    <span className="px-3 py-2 text-sm text-gray-600 truncate flex-1">
                        {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                </div>
              </div>

              <Button
                onClick={uploadExcel}
                disabled={isUploading}
                className="w-full bg-[#27ae60] hover:bg-[#219653] text-white font-medium mt-2"
              >
                {isUploading ? (
                   <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                   "Upload"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Download Template Card */}
        <Card className="shadow-sm bg-white border-none">
          <CardHeader className="pb-4 border-b border-gray-200">
             <CardTitle className="text-base font-medium flex items-center gap-2 text-slate-700">
              <FileDown className="h-5 w-5" />
              Download Excel Template
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <p className="text-sm text-slate-500 leading-relaxed">
              Select a sector and download the template to fill in your data. The template will include all districts and data categories for the selected sector.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 text-sm">Sector</Label>
                <Select value={templateSector} onValueChange={setTemplateSector}>
                  <SelectTrigger className="bg-white w-full border-gray-300">
                    <SelectValue placeholder="Select Sector" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id.toString()} className="hover:bg-gray-100">
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={downloadTemplate}
                disabled={isDownloading}
                className="w-full bg-[#6c7b95] hover:bg-[#5b6a84] text-white font-medium"
              >
                {isDownloading ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                   <Download className="mr-2 h-4 w-4" />
                )}
                Download Excel Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}