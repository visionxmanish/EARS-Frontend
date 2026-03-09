import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEconomicDataStore, type EconomicDataProgress } from "../store/useEconomicDataStore";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader2 } from "lucide-react";
import apiClient from "@/lib/axios";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";

interface ViewEconomicDataDialogProps {
  progress: EconomicDataProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
// Reject dialog box
interface RejectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entryId: number;
}

export function RejectDialog({ open, onOpenChange, entryId }: RejectDialogProps) {
    const [reason, setReason] = useState("");
    const { rejectProgressEntry } = useEconomicDataStore();
    
    const handleReject = async () => {
        if (reason.trim() !== "") {
            try {
                await rejectProgressEntry(entryId, reason);
                onOpenChange(false);
            } catch (error) {
                console.error("Failed to reject entry", error);
                alert("Failed to reject entry");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white sm:max-w-[400px] border-none max-w-6xl max-h-[50vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Reject Data Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-gray-500">Enter the reason for rejecting this data entry:</p>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleReject}>
                        Reject
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface EditEntryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entryId: number;
    initialValue: string | number;
}

export function EditEntryDialog({ open, onOpenChange, entryId, initialValue }: EditEntryDialogProps) {
    const [value, setValue] = useState(initialValue);
    const { editProgressEntry } = useEconomicDataStore();
    
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSave = async () => {
        if (value !== "") {
            try {
                await editProgressEntry(entryId, Number(value));
                onOpenChange(false);
            } catch (error) {
                console.error("Failed to edit entry", error);
                alert("Failed to edit entry");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white sm:max-w-[400px] border-none">
                <DialogHeader>
                    <DialogTitle>Edit & Resend Data Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-500">Update the value and resend for approval.</p>
                    <div className="grid gap-2">
                         <label htmlFor="value" className="text-sm font-medium">New Value <span className="text-red-500">*</span></label>
                         <input
                            id="value"
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                         />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={value === ""}>
                        Resend
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ViewEconomicDataDialog({ progress, open, onOpenChange }: ViewEconomicDataDialogProps) {
  const { user } = useAuthStore();
  const canEdit = user?.role === 'maker' || user?.role === 'admin';

  const [categories, setCategories] = useState<any[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const { fetchProgressEntries, selectedProgressEntries, isLoadingEntries } = useEconomicDataStore();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectEntryId, setRejectEntryId] = useState<number | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editEntryId, setEditEntryId] = useState<number | null>(null);
  const [editEntryValue, setEditEntryValue] = useState<number | string>("");

  const handleReject = (entryId: number) => {
    setRejectEntryId(entryId);
    setRejectDialogOpen(true);
  };

  const handleEdit = (entryId: number, currentValue: any) => {
    setEditEntryId(entryId);
    setEditEntryValue(currentValue);
    setEditDialogOpen(true);
  };

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
    <>
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
                                                    status={rootEntry.status}
                                                    isRoot 
                                                    onReject={() => handleReject(rootEntry.id)}
                                                    rejectedReason={rootEntry.rejected_reason}
                                                    onEdit={() => handleEdit(rootEntry.id, rootEntry.value)}
                                                    canEdit={canEdit}
                                                  />
                                              )}
                                              <div className="pl-4 mt-2 space-y-2">
                                                  {node.children.map((child: any) => (
                                                      <CategoryNode key={child.id} node={child} entries={entries} depth={0} onReject={handleReject} onEdit={handleEdit} canEdit={canEdit} />
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

    {rejectEntryId !== null && (
        <RejectDialog 
            open={rejectDialogOpen} 
            onOpenChange={setRejectDialogOpen} 
            entryId={rejectEntryId} 
        />
    )}

    {editEntryId !== null && (
        <EditEntryDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            entryId={editEntryId}
            initialValue={editEntryValue}
        />
    )}
    </>
  );
}

function CategoryNode({ node, entries, depth, onReject, onEdit, canEdit }: { node: any, entries: any[], depth: number, onReject: (id: number) => void, onEdit: (id: number, val: any) => void, canEdit: boolean }) {
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
                        onReject={() => onReject(entry.id)}
                        rejectedReason={entry?.rejected_reason}
                        onEdit={() => onEdit(entry.id, entry.value)}
                        canEdit={canEdit}
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
                        <CategoryNode key={child.id} node={child} entries={entries} depth={depth + 1} onReject={onReject} onEdit={onEdit} canEdit={canEdit} />
                    ))}
                </div>
            )}
        </div>
    )
}

function DataRow({ name, value, unit, isRoot, status, onReject, rejectedReason, onEdit, canEdit }: { name: string, value: string, unit?: string, isRoot?: boolean, status?: string, onReject?: () => void, rejectedReason?: string, onEdit?: () => void, canEdit?: boolean }) {
    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
            case 'rejected': return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
            case 'pending': return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200";
        }
    };

    return (
        <div className="flex flex-col w-full">
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
                    {status?.toLowerCase() === 'pending' && onReject && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onReject}
                            className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 ml-1"
                        >
                            Reject
                        </Button>
                    )}
                    {status?.toLowerCase() === 'rejected' && canEdit && onEdit && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onEdit}
                            className="h-6 text-xs px-2 ml-1"
                        >
                            Edit & Resend
                        </Button>
                    )}
                </div>
            </div>
            {status?.toLowerCase() === 'rejected' && rejectedReason && (
                <div className="text-xs text-red-600 mt-1.5 bg-red-50 p-2 rounded border border-red-100 w-full mb-1">
                    <span className="font-semibold">Reject Reason:</span> {rejectedReason}
                </div>
            )}
        </div>
    );
}
