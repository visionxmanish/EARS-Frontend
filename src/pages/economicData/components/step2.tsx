import { Button } from "@/components/ui/button";
import { useAddEconomicDataStore } from "../store/useAddEconomicDataStore";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { useSectorStore } from "@/pages/sectors/store/useSectorStore";
import { useEffect } from "react";

export default function Step2() {
    const { formData, setFormData, setStep } = useAddEconomicDataStore();
    const { sectors, fetchSectors } = useSectorStore();

    useEffect(() => {
        fetchSectors();
    }, []);

    const isFormValid = !!formData.sector;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Select Sector *</Label>
            <div className="relative">
                <select
                    className="flex h-12 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-gray-700"
                    value={formData.sector}
                    onChange={(e) => setFormData({ sector: e.target.value })}
                >
                    <option value="" disabled>Select Sector</option>
                    {sectors.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                            {sector.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        </div>
             <div className="flex justify-between pt-4">
                <Button 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-gray-300 text-gray-700"
                >
                Back
                </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    onClick={() => setStep(3)}
                    disabled={!isFormValid}
                >
                Next
                </Button>
            </div>
        </div>
    );
}
