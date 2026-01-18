import { useFiscalStore } from "@/pages/fiscal_year/store/useFiscalStore";
import { useAddEconomicDataStore } from "../store/useAddEconomicDataStore";
import { useCommonDataStore } from "@/store/useCommonDataStore";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { ChevronDown } from "lucide-react";

export default function Step1() {
  const {
    formData,
    setFormData,
    setStep,
  } = useAddEconomicDataStore();

  const {
    fiscalYears,
    fetchFiscalYears
  } = useFiscalStore();

  const {
    reportTypes,
    fetchReportTypes,
    fetchProvinces,
    fetchDistricts,
    fetchMunicipalities,
    fetchCurrentUserData,
    getAccessibleProvinces,
    getAccessibleDistricts,
    getAccessibleMunicipalities
  } = useCommonDataStore();

  useEffect(() => {
    fetchFiscalYears();
    fetchReportTypes();
    fetchProvinces();
    fetchCurrentUserData();
  }, []);

  useEffect(() => {
    if (formData.province) {
      fetchDistricts(Number(formData.province));
    }
  }, [formData.province]);

  useEffect(() => {
    if (formData.district) {
      fetchMunicipalities(Number(formData.district));
    }
  }, [formData.district]);

  // Derived state using store getters
  const filteredProvinces = getAccessibleProvinces();
  const filteredDistricts = getAccessibleDistricts();
  const filteredMunicipalities = getAccessibleMunicipalities();

  const handleProvinceChange = (value: string) => {
    setFormData({
      province: value,
      district: "",
      localBody: "",
    });
  };

  const handleDistrictChange = (value: string) => {
    setFormData({
      district: value,
      localBody: "",
    });
  };

  const isFormValid =
    formData.fiscalYear &&
    formData.reportType &&
    formData.province &&
    formData.district &&
    formData.localBody;

  return (
    <div className="space-y-6">
        {/* Fiscal Year */}
        <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Select Fiscal Year *</Label>
            <div className="relative">
                <select
                    className="flex h-12 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-gray-700"
                    value={formData.fiscalYear}
                    onChange={(e) => setFormData({ fiscalYear: e.target.value })}
                >
                    <option value="" disabled>Select Fiscal Year</option>
                    {fiscalYears.map((fy) => (
                        <option key={fy.id} value={fy.id}>
                            {fy.year}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        </div>

        {/* Report Type */}
        <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Select Report Type *</Label>
            <div className="relative">
                <select
                    className="flex h-12 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-gray-700"
                    value={formData.reportType}
                    onChange={(e) => setFormData({ reportType: e.target.value })}
                >
                    <option value="" disabled>Select Report Type</option>
                    {reportTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                            {rt.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        </div>

        {/* Province */}
        <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Select Province *</Label>
             <div className="relative">
                <select
                    className="flex h-12 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-gray-700"
                    value={formData.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                >
                    <option value="" disabled>Select Province</option>
                    {filteredProvinces.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        </div>

        {/* District */}
        <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Select District *</Label>
             <div className="relative">
                <select
                    className="flex h-12 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-gray-700"
                    value={formData.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={!formData.province}
                >
                    <option value="" disabled>Select District</option>
                    {filteredDistricts.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        </div>

        {/* Local Body */}
        <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Select Local Body *</Label>
             <div className="relative">
                <select
                    className="flex h-12 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-gray-700"
                    value={formData.localBody}
                    onChange={(e) => setFormData({ localBody: e.target.value })}
                    disabled={!formData.district}
                >
                    <option value="" disabled>Select Local Body</option>
                    {filteredMunicipalities.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} {m.type && `(${m.type})`}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-10"
                onClick={() => setStep(2)}
                disabled={!isFormValid}
            >
            Continue
            </Button>
        </div>
    </div>
  );
}
