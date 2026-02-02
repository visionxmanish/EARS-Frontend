import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEconomicDataStore, type EconomicDataProgress } from "../store/useEconomicDataStore";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader2 } from "lucide-react";
import apiClient from "@/lib/axios";
import { format } from "date-fns";

interface ViewEconomicDataDialogProps {
  progress: EconomicDataProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEconomicDataDialog({ progress, open, onOpenChange }: ViewEconomicDataDialogProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const { fetchProgressEntries, selectedProgressEntries, isLoadingEntries } = useEconomicDataStore();

  useEffect(() => {
    if (open && progress) {
        loadData();
    }
  }, [open, progress]);

  const loadData = async () => {
      if (!progress) return;
      setIsLocalLoading(true);
      try {
          // 1. Fetch Entries via Store
          await fetchProgressEntries(progress.id);

          // 2. Fetch Categories for the sector (kept local as it's UI specific for tree)
          const catsRes = await apiClient.get('/data-categories/', {
              params: { sector: progress.sector, ordering: 'id', page_size: 1000 }
          });
          setCategories(catsRes.data.results || catsRes.data);

      } catch (error) {
          console.error("Failed to load details", error);
      } finally {
          setIsLocalLoading(false);
      }
  };

  const isLoading = isLoadingEntries || isLocalLoading;
  const entries = selectedProgressEntries;

  // Build Tree Logic
  const categoryTree = (() => {
      if (!entries.length || !categories.length) return [];
      
      const valuesMap: Record<number, any> = {};
      entries.forEach((e: any) => {
          valuesMap[e.category] = e;
      });
      
      const relevantNodes = new Set<number>();
      const addNodeAndAncestors = (id: number) => {
           relevantNodes.add(id);
           const node = categories.find(c => c.id === id);
           if (node && node.parent) {
               addNodeAndAncestors(node.parent);
           }
      };

      Object.keys(valuesMap).forEach(catId => addNodeAndAncestors(Number(catId)));

       const treeNodes: any[] = [];
       const nodeMap = new Map<number, any>();

       categories.forEach(cat => {
           if (relevantNodes.has(cat.id)) {
               nodeMap.set(cat.id, { ...cat, children: [] });
           }
       });

       nodeMap.forEach(node => {
           if (node.parent && nodeMap.has(node.parent)) {
               nodeMap.get(node.parent).children.push(node);
           } else {
               treeNodes.push(node);
           }
       });

       return treeNodes;
  })();

  if (!progress) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[800px] border-none max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Economic Data Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        ) : (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold">Fiscal Year</span>
                        <p className="font-medium">{progress.fiscal_year_name || progress.fiscal_year}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold">Sector</span>
                        <p className="font-medium">{progress.sector_name || progress.sector}</p>
                    </div>
                     <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold">Report Type</span>
                        <p className="font-medium">{progress.report_type_name || progress.report_type}</p>
                    </div>
                    <div>
                         <span className="text-xs text-gray-500 uppercase font-semibold">Place</span>
                         <p className="font-medium">{progress.municipality_name || progress.district_name || progress.province_name || "N/A"}</p>
                    </div>
                    <div>
                         <span className="text-xs text-gray-500 uppercase font-semibold">Internal Status</span>
                         <p className="font-medium capitalize">{progress.status}</p>
                    </div>
                     <div>
                         <span className="text-xs text-gray-500 uppercase font-semibold">Submitted Date</span>
                         <p className="font-medium">{progress.created_at ? format(new Date(progress.created_at), 'MMM dd, yyyy') : "N/A"}</p>
                    </div>
                </div>

                <div>
                     <h3 className="text-lg font-medium mb-4">Data Entries</h3>
                     {categoryTree.length === 0 ? (
                         <p className="text-gray-500 italic">No data entries found.</p>
                     ) : (
                         <div className="space-y-4">
                             {categoryTree.map((node) => {
                                 const rootEntry = entries.find((e: any) => e.category === node.id);
                                 return (
                                     <div key={node.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                         <div className="bg-gray-50 px-4 py-2 font-medium border-b border-gray-100">
                                             {node.name}
                                         </div>
                                         <div className="p-4">
                                              {rootEntry && (
                                                  <DataRow 
                                                    name={node.name} 
                                                    value={rootEntry.value} 
                                                    unit={node.unit} 
                                                    isRoot 
                                                  />
                                              )}
                                              <div className="pl-4 mt-2 space-y-2">
                                                  {node.children.map((child: any) => (
                                                      <CategoryNode key={child.id} node={child} entries={entries} depth={0} />
                                                  ))}
                                              </div>
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                     )}
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryNode({ node, entries, depth }: { node: any, entries: any[], depth: number }) {
    const entry = entries.find((e: any) => e.category === node.id);
    const hasValue = !!entry;

    return (
        <div className="">
            {hasValue && (
                <div className={`flex items-center py-1 ${depth > 0 ? "ml-4" : ""}`}>
                     <DataRow 
                        name={node.name} 
                        value={entry?.value} 
                        unit={node.unit} 
                        status={entry?.status}
                     />
                </div>
            )}
            
            {!hasValue && node.children.length > 0 && (
                <div className={`py-1 ${depth > 0 ? "ml-4" : ""}`}>
                    <span className="text-gray-500 text-sm font-medium">{node.name}</span>
                </div>
            )}

            {node.children.length > 0 && (
                <div className={`ml-4 border-l border-gray-100 pl-2`}>
                    {node.children.map((child: any) => (
                        <CategoryNode key={child.id} node={child} entries={entries} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

function DataRow({ name, value, unit, isRoot, status }: { name: string, value: string, unit?: string, isRoot?: boolean, status?: string }) {
    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
            case 'rejected': return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
            case 'pending': return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200";
        }
    };

    return (
        <div className={`flex justify-between items-center w-full`}>
            <span className={`text-gray-600 flex items-center gap-2 ${isRoot ? "font-medium" : "text-sm"}`}>
                {!isRoot && <Coins className="h-3.5 w-3.5 text-gray-400" />}
                {name}
            </span>
            <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800">
                    {Number(value).toLocaleString()}
                    {unit && <span className="text-xs font-normal text-gray-400 ml-1">({unit})</span>}
                </span>
                {status && (
                    <Badge variant="outline" className={`h-5 text-[10px] px-1.5 ${getStatusColor(status)}`}>
                        {status}
                    </Badge>
                )}
            </div>
        </div>
    );
}
