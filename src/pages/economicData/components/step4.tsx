import { useEffect } from "react";
import { useAddEconomicDataStore } from "../store/useAddEconomicDataStore";
import { useCommonDataStore } from "@/store/useCommonDataStore";
import { useFiscalStore } from "@/pages/fiscal_year/store/useFiscalStore";
import { useSectorStore } from "@/pages/sectors/store/useSectorStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Coins, FileText, MapPin, Calendar, Activity } from "lucide-react";

export default function Step4() {
    const { formData, setStep, dataCategories, fetchDataCategoriesList } = useAddEconomicDataStore();
    const { 
        provinces, districts, municipalities, reportTypes,
        fetchProvinces, fetchReportTypes, fetchDistricts, fetchMunicipalities
    } = useCommonDataStore();
    const { fiscalYears, fetchFiscalYears } = useFiscalStore();
    const { sectors, fetchSectors } = useSectorStore();

    // Ensure metadata is available for mapping IDs to Names
    useEffect(() => {
        if (fiscalYears.length === 0) fetchFiscalYears();
        if (reportTypes.length === 0) fetchReportTypes();
        if (provinces.length === 0) fetchProvinces();
        if (sectors.length === 0) fetchSectors();
        // If we refreshed on step 4, we might need these:
        if (formData.province && districts.length === 0) fetchDistricts(Number(formData.province));
        if (formData.district && municipalities.length === 0) fetchMunicipalities(Number(formData.district));
        if (formData.sector && dataCategories.length === 0) fetchDataCategoriesList();
    }, []);

    // Helper to find name by ID
    const getNameById = (list: any[], id: string | number) => {
        const item = list.find(item => item.id.toString() === id.toString());
        return item ? item.name : "N/A";
    };

    // Helper to find year by ID (for fiscal year)
    const getFiscalYearName = (id: string) => {
        const item = fiscalYears.find(item => item.id.toString() === id.toString());
        return item ? item.year : "N/A";
    };

    // Build specific tree for review
    const categoryTree = (() => {
        const entries = formData.dataValues || {};
        const entriesIds = Object.keys(entries).map(Number);
        
        if (entriesIds.length === 0) return [];

        // 1. Find all relevant nodes (nodes with values + their ancestors)
        const relevantNodes = new Set<number>();
        
        const addNodeAndAncestors = (id: number) => {
            relevantNodes.add(id);
            const node = dataCategories.find(c => c.id === id);
            if (node && node.parent) {
                addNodeAndAncestors(node.parent);
            }
        };

        entriesIds.forEach(id => addNodeAndAncestors(id));

        // 2. Build Tree Structure
        const treeNodes: any[] = [];
        const nodeMap = new Map<number, any>();

        // Sort mainly to ensure parents process before children if we were doing single pass, 
        // but here we just stash everything in map first
        dataCategories.forEach(cat => {
            if (relevantNodes.has(cat.id)) {
                nodeMap.set(cat.id, { ...cat, children: [] });
            }
        });

        // Assemble tree
        nodeMap.forEach(node => {
            if (node.parent && nodeMap.has(node.parent)) {
                nodeMap.get(node.parent).children.push(node);
            } else {
                treeNodes.push(node);
            }
        });

        return treeNodes;
    })();

    const handleSubmit = () => {
        console.log("Submitting Data:", formData);
        // Add submission logic here
    };

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Review & Submit</h2>
                
                {/* Section 1: General Information */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <h3 className="font-medium text-gray-800">General Information</h3>
                    </div>
                    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <ReviewItem 
                            icon={<Calendar className="h-4 w-4" />} 
                            label="Fiscal Year" 
                            value={getFiscalYearName(formData.fiscalYear)} 
                        />
                        <ReviewItem 
                            icon={<Activity className="h-4 w-4" />} 
                            label="Report Type" 
                            value={getNameById(reportTypes, formData.reportType)} 
                        />
                        <ReviewItem 
                            icon={<Activity className="h-4 w-4" />} 
                            label="Sector" 
                            value={getNameById(sectors, formData.sector)} 
                        />
                         <ReviewItem 
                            icon={<MapPin className="h-4 w-4" />} 
                            label="Province" 
                            value={getNameById(provinces, formData.province)} 
                        />
                        <ReviewItem 
                            icon={<MapPin className="h-4 w-4" />} 
                            label="District" 
                            value={getNameById(districts, formData.district)} 
                        />
                        <ReviewItem 
                            icon={<MapPin className="h-4 w-4" />} 
                            label="Local Body" 
                            value={getNameById(municipalities, formData.localBody)} 
                        />
                    </div>
                </div>

                {/* Section 2: Economic Data */}
                <div className="space-y-4">
                     <h3 className="text-lg font-medium text-gray-800 pl-1">Economic Data Entries</h3>
                     {categoryTree.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                            No economic data entered.
                        </div>
                     ) : (
                         <div className="space-y-6">
                             {categoryTree.map((rootNode) => (
                                <div key={rootNode.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-none">
                                    <div className="px-4 py-3">
                                        <h4 className="font-medium text-lg leading-none">{rootNode.name}</h4>
                                    </div>
                                    <div className="p-1 px-4 pb-4">
                                        {/* If root itself has a value, show it (though simplified Step 3 logic might usually assign values to children) */}
                                        {formData.dataValues[rootNode.id] && (
                                            <div className="mb-4 pb-4 border-b border-gray-50">
                                                <DataRow name={rootNode.name} value={formData.dataValues[rootNode.id]} unit={rootNode.unit} isRoot />
                                            </div>
                                        )}
                                        {/* Render Children Recursively */}
                                        <div className="space-y-1 px-5">
                                            {rootNode.children.map((child: any) => (
                                                <CategoryNode key={child.id} node={child} dataValues={formData.dataValues} depth={0} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                             ))}
                         </div>
                     )}
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <Button 
                    variant="ghost" 
                    onClick={() => setStep(3)}
                    className="text-[#0066cc] hover:text-blue-700 hover:bg-blue-50 font-medium h-10 px-6"
                >
                    Back
                </Button>
                <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-8 h-10 font-medium shadow-sm transition-colors"
                    onClick={handleSubmit}
                >
                    Submit Data
                </Button>
            </div>
        </div>
    );
}

// Recursive component for tree items
function CategoryNode({ node, dataValues, depth }: { node: any, dataValues: any, depth: number }) {
    const hasValue = dataValues[node.id];
    
    return (
        <div className="relative">
             {/* Render self if has value */}
             {hasValue && (
                <div className={`flex items-center py-2 ${depth > 0 ? "ml-4" : ""}`}>
                     {/* Tree Thread Line */}
                    <div className="absolute left-0 top-0 bottom-0 border-l border-gray-200 w-px -ml-[1px]" style={{ left: '-12px' }} />
                    <div className="absolute left-[-12px] top-1/2 w-3 border-t border-gray-200" />
                    
                    <DataRow name={node.name} value={dataValues[node.id]} unit={node.unit} />
                </div>
             )}

             {/* Render self even if no value, BUT only if it's a parent wrapper for other children? 
                 Actually, relevantNodes logic included ancestors. 
                 If an ancestor has no value but has relevant children, we might want to show it as a sub-header.
             */}
             {!hasValue && node.children.length > 0 && (
                 <div className={`py-2 ${depth > 0 ? "ml-4 relative" : ""}`}>
                    {depth >= 0 && (
                        <>
                         <div className="absolute left-0 top-0 bottom-0 border-l border-gray-200 w-px -ml-[1px]" style={{ left: '-12px' }} />
                         <div className="absolute left-[-12px] top-4 w-3 border-t border-gray-200" />
                        </>
                    )}
                    <h5 className="text-gray-500 font-medium text-sm mb-2">{node.name}</h5>
                 </div>
             )}

             {/* Render Children */}
             {node.children.length > 0 && (
                 <div className={`ml-6 border-l border-gray-100 pl-2 ${!hasValue ? "mt-[-8px]" : ""}`}>
                     {node.children.map((child: any) => (
                         <CategoryNode key={child.id} node={child} dataValues={dataValues} depth={depth + 1} />
                     ))}
                 </div>
             )}
        </div>
    );
}

function DataRow({ name, value, unit, isRoot }: { name: string, value: string, unit?: string, isRoot?: boolean }) {
    return (
        <div className={`flex justify-between items-center w-full ${isRoot ? "" : ""}`}>
            <span className={`text-gray-600 font-medium flex items-center gap-2 ${isRoot ? "text-base" : "text-sm"}`}>
                {!isRoot && <Coins className="h-3.5 w-3.5 text-gray-400" />}
                {name}
            </span>
            <span className="font-semibold text-gray-800">
                {value}
                {unit && <span className="text-xs font-normal text-gray-400 ml-1">({unit})</span>}
            </span>
        </div>
    );
}

function ReviewItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="space-y-1">
            <Label className="text-gray-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                {icon}
                {label}
            </Label>
            <p className="text-gray-800 font-medium text-base pl-5">{value}</p>
        </div>
    );
}
