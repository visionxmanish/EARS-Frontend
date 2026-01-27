import { useEffect, useState } from "react";
import { useFiscalStore } from "@/pages/fiscal_year/store/useFiscalStore";
import { useSectorStore } from "@/pages/sectors/store/useSectorStore";
import { useCommonDataStore } from "@/store/useCommonDataStore";
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
import { FileText } from "lucide-react";

export default function ReportPage() {
  const { fiscalYears, fetchFiscalYears } = useFiscalStore();
  const { sectors, fetchSectors } = useSectorStore();
  const { reportTypes, fetchReportTypes } = useCommonDataStore();
  
  // State for Generate Level Report
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedReportLevel, setSelectedReportLevel] = useState<string>("");

  // State for Generate Report for Sectors with Different Report
  const [selectedFiscalYear2, setSelectedFiscalYear2] = useState<string>("");
  const [selectedSector2, setSelectedSector2] = useState<string>("");
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [selectedReportLevel2, setSelectedReportLevel2] = useState<string>("");

  useEffect(() => {
    fetchFiscalYears();
    fetchSectors();
    fetchReportTypes();
  }, []);

  const handleGenerateLevelReport = () => {
    console.log("Generate Level Report", {
        fiscalYear: selectedFiscalYear,
        sector: selectedSector,
        reportLevel: selectedReportLevel
    });
  };

  const handleGenerateDifferentReport = () => {
     console.log("Generate Different Report", {
        fiscalYear: selectedFiscalYear2,
        sector: selectedSector2,
        reportType: selectedReportType,
        reportLevel: selectedReportLevel2
    });
  };

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Generate Level Report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="text-primary hover:underline cursor-pointer">Dashboard</span> / Generate Level Report
        </p>
      </div>

      <Card className="shadow-sm bg-white border-none">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-slate-700">
            <FileText className="h-5 w-5" />
            Report Generation Form
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 w-full">
              <Label className="font-semibold text-slate-700">Fiscal Year</Label>
              <Select value={selectedFiscalYear} onValueChange={setSelectedFiscalYear}>
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select Fiscal Year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((fy) => (
                    <SelectItem key={fy.id} value={fy.id.toString()}>
                      {fy.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label className="font-semibold text-slate-700">Sector</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id.toString()}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label className="font-semibold text-slate-700">Report Level</Label>
              <Select value={selectedReportLevel} onValueChange={setSelectedReportLevel}>
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select Report Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="municipality">Municipality Level</SelectItem>
                  <SelectItem value="district">District Level</SelectItem>
                  <SelectItem value="province">Province Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-md p-4 space-y-2">
            <h4 className="font-semibold text-blue-600">Report Level Information:</h4>
            <ul className="list-disc md:list-none space-y-1 ml-4 md:ml-0">
               <li className="text-sm text-blue-500/90 flex items-start gap-2">
                <span className="hidden md:block">•</span>
                <span><span className="font-semibold">Municipality Level:</span> Shows detailed data for each municipality</span>
              </li>
              <li className="text-sm text-blue-500/90 flex items-start gap-2">
                <span className="hidden md:block">•</span>
                <span><span className="font-semibold">District Level:</span> Aggregates municipality data to district level</span>
              </li>
              <li className="text-sm text-blue-500/90 flex items-start gap-2">
                <span className="hidden md:block">•</span>
                <span><span className="font-semibold">Province Level:</span> Shows aggregated data for each province</span>
              </li>
            </ul>
          </div>

          <div>
             <Button 
                onClick={handleGenerateLevelReport}
                className="bg-[#0564bc] hover:bg-[#0564bc]/90 text-white font-medium px-6"
             >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
             </Button>
          </div>
        </CardContent>
      </Card>

      {/* Second Section: Generate Report for Sectors with Different Report */}
      <Card className="shadow-sm border-none bg-white">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-slate-700">
            <FileText className="h-4 w-4" />
            Generate Report for Sectors with Different Report
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 w-full">
              <Label className="font-semibold text-slate-700">Fiscal Year</Label>
              <Select value={selectedFiscalYear2} onValueChange={setSelectedFiscalYear2}>
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select Fiscal Year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((fy) => (
                    <SelectItem key={fy.id} value={fy.id.toString()}>
                      {fy.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label className="font-semibold text-slate-700">Sector (Different Report)</Label>
              <Select value={selectedSector2} onValueChange={setSelectedSector2}>
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors
                    .filter(s => s.has_different_report)
                    .map((sector) => (
                    <SelectItem key={sector.id} value={sector.id.toString()}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label className="font-semibold text-slate-700">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select Report Type" />
                </SelectTrigger>
                <SelectContent>
                   {reportTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id.toString()}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label className="font-semibold text-slate-700">Report Level</Label>
              <Select value={selectedReportLevel2} onValueChange={setSelectedReportLevel2}>
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select Report Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="municipality">Municipality Level</SelectItem>
                  <SelectItem value="district">District Level</SelectItem>
                  <SelectItem value="province">Province Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-md p-4 space-y-2">
            <h4 className="font-semibold text-blue-600">Percentage Level Report:</h4>
            <ul className="list-disc md:list-none space-y-1 ml-4 md:ml-0">
               <li className="text-sm text-blue-500/90 flex items-start gap-2">
                <span className="hidden md:block">•</span>
                <span><span className="font-semibold">Municipality Level:</span> Shows Percentage Report detailed data for each municipality</span>
              </li>
              <li className="text-sm text-blue-500/90 flex items-start gap-2">
                 <span className="hidden md:block">•</span>
                <span><span className="font-semibold">District Level:</span> Aggregates municipality data to district level for Percentage Report</span>
              </li>
              <li className="text-sm text-blue-500/90 flex items-start gap-2">
                <span className="hidden md:block">•</span>
                <span><span className="font-semibold">Province Level:</span> Shows aggregated data for each province for Percentage Report</span>
              </li>
            </ul>
          </div>

          <div>
             <Button 
                onClick={handleGenerateDifferentReport}
                className="bg-[#0564bc] hover:bg-[#0564bc]/90 text-white font-medium px-6"
             >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
