import { useEffect } from "react";
import { useAddEconomicDataStore } from "../store/useAddEconomicDataStore";
import { useCommonDataStore } from "@/store/useCommonDataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins } from "lucide-react";
import { Label } from "@radix-ui/react-label";

export default function Step3() {
    const { 
        setStep, 
        fetchDataCategoriesList, 
        dataCategories, 
        isLoading, 
        economicDataValues, 
        setEconomicDataValue 
    } = useAddEconomicDataStore();
    
    const { currentUserData, fetchCurrentUserData } = useCommonDataStore();

    useEffect(() => {
        fetchDataCategoriesList();
        if (!currentUserData) {
            fetchCurrentUserData();
        }
    }, []);

    const groupedCategories = (() => {
        if (!currentUserData || !currentUserData.user_related_offices) return [];

        // 1. Filter children based on permissions
        const validChildren = dataCategories.filter(category => {
            // Only check permissions for children (non-null parent)
            if (category.parent) {
                return currentUserData.user_related_offices.includes(category.related_office);
            }
            return false; // We are treating top-level items as headers/parents, not direct inputs for now based on "show the parent" request
        });

        // 2. Identify relevant parents
        const parents = dataCategories.filter(c => c.parent === null);
        
        // 3. Group children by parent
        const groups = parents.map(parent => {
            const children = validChildren.filter(child => child.parent === parent.id);
            return {
                parent,
                children
            };
        }).filter(group => group.children.length > 0); 

        return groups;
    })();

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">Loading categories...</div>
            ) : groupedCategories.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">No data categories available for your office permissions.</div>
            ) : (
                <div className="space-y-8">
                    {groupedCategories.reverse().map(({ parent, children }) => (
                        <div key={parent.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-none">
                            <div className="bg-gray-100 text-black px-6 py-3 border-b border-gray-100">
                                <h3 className="text-black font-medium text-lg leading-none">{parent.name}</h3>
                            </div>
                            
                            <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {children.map((child) => (
                                    <div key={child.id} className="space-y-2">
                                        <Label className="text-gray-700 font-medium">
                                            {child.name} <span className="text-gray-400 font-normal">Unit:  {child.unit ? `(${child.unit})` : ''}</span>
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                <Coins className="h-4 w-4 opacity-50" />
                                            </div>
                                            <Input
                                                type="number"
                                                placeholder="Enter value"
                                                className="pl-9 bg-white h-11 border-gray-200 focus:border-gray-500 focus:ring-gray-500 transition-colors"
                                                value={economicDataValues[child.id] || ""}
                                                onChange={(e) => setEconomicDataValue(child.id.toString(), e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center pt-4">
                <Button 
                    variant="ghost" 
                    onClick={() => setStep(2)}
                    className="text-[#0066cc] hover:text-blue-700 hover:bg-blue-50 font-medium h-10 px-6"
                >
                    Back
                </Button>
                <Button 
                    className="bg-[#0066cc] hover:bg-blue-700 text-white px-8 h-10 font-medium shadow-sm transition-colors"
                    onClick={() => console.log('Save Progress', economicDataValues)}
                >
                    Review
                </Button>
            </div>
        </div>
    );
}
