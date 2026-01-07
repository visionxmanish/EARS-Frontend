import { useEffect, useState } from "react";
import { useDataCategoryStore, type DataCategory } from "./store/useDataCategoryStore";
import { useDataCategoryTree } from "./store/useDataCategoryTree";
import { useSectorStore } from "@/pages/sectors/store/useSectorStore";
import { useUserRelatedOfficeStore } from "@/store/useUserRelatedOfficeStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Status } from "@/constants/enum/statusEnum";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, CheckCircle, XCircle, Plus, Search, Filter, CornerDownRight } from "lucide-react";

export default function DataCategoriesPage() {
  const {
    categories,
    isLoading: isCategoryLoading,
    error: categoryError,
    currentPage,
    totalPages,
    fetchDataCategories,
    createDataCategory,
    updateDataCategory,
    deleteDataCategory,
    approveDataCategory,
    rejectDataCategory,
  } = useDataCategoryStore();
  
  const { sectors, fetchSectors } = useSectorStore();
  const { offices, fetchUserRelatedOffices } = useUserRelatedOfficeStore();
  const { user } = useAuthStore();
  
  // Filters
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
      name: "",
      parent: "" as string | number, 
      unit: "",
      is_summable: true,
      related_office: "" as string | number, 
  });
  
  // Delete Alert
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Initial Load of Sectors and Offices
  useEffect(() => {
      fetchSectors({ status: Status.APPROVED });
      fetchUserRelatedOffices({ status: Status.APPROVED }); 
  }, [fetchSectors, fetchUserRelatedOffices]);

  // Fetch Categories when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchDataCategories({ 
            page: currentPage, 
            search: searchQuery, 
            status: statusFilter,
            sector: selectedSector || undefined 
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchDataCategories, currentPage, searchQuery, statusFilter, selectedSector]); 

  const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
          fetchDataCategories({ 
              page, 
              search: searchQuery, 
              status: statusFilter,
              sector: selectedSector || undefined
           });
      }
  }

  const openCreate = () => {
    if (!selectedSector) {
        alert("Please select a sector first to create a category.");
        return;
    }
    setEditingId(null);
    setFormData({ name: "", parent: "", unit: "", is_summable: true, related_office: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (cat: DataCategory) => {
    setEditingId(cat.id);
    setFormData({
        name: cat.name,
        parent: cat.parent || "",
        unit: cat.unit,
        is_summable: cat.is_summable,
        related_office: cat.related_office || ""
    });
    // Ensure we are in the correct sector context or just allow editing
    if (!selectedSector && cat.sector) {
        setSelectedSector(cat.sector.toString());
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSector) {
        alert("Sector context is missing.");
        return;
    }
    
    // Convert parent to number or ""
    const parentId = formData.parent ? Number(formData.parent) : "";
    const officeId = formData.related_office ? Number(formData.related_office) : "";
    
    try {
        if (editingId) {
            await updateDataCategory(editingId, {
                name: formData.name,
                parent: parentId,
                unit: formData.unit,
                is_summable: formData.is_summable,
                related_office: officeId
            });
            // Refetch to see updates
             fetchDataCategories({ 
                page: currentPage, 
                search: searchQuery, 
                status: statusFilter,
                sector: selectedSector
            });
        } else {
            await createDataCategory({
                sector: Number(selectedSector),
                name: formData.name,
                parent: parentId,
                unit: formData.unit,
                is_summable: formData.is_summable,
                related_office: officeId
            });
        }
        setIsDialogOpen(false);
        setEditingId(null);
    } catch (err) {
        // Error handled in store
    }
  };

  const confirmDelete = async () => {
      if (deleteId) {
          try {
              await deleteDataCategory(deleteId);
              setDeleteId(null);
              // Store might not auto-refresh if it doesn't know parameters, so manual refresh
               fetchDataCategories({ 
                page: currentPage, 
                search: searchQuery, 
                status: statusFilter,
                sector: selectedSector || undefined
            });
          } catch(err) {
              // Error handled in store
          }
      }
  }
  
  const handleApprove = async (id: number) => {
      if (confirm("Are you sure you want to approve?")) {
          await approveDataCategory(id);
      }
  };

  const handleReject = async (id: number) => {
      if (confirm("Are you sure you want to reject?")) {
        await rejectDataCategory(id);
      }
  };

  const canApprove = user?.role === 'checker' || user?.role === 'admin';

  // Helper to get potential parents (exclude self and MUST be top level i.e. parent is null)
  const potentialParents = categories.filter(c => c.id !== editingId && c.parent === null);

  // If a parent is selected, summable should be disabled (and forced to false maybe?)
  // Requirement: "the summable shall be selectable only for the top level category"
  const isTopLevel = !formData.parent; 

  // Watch parent selection to enforce is_summable logic
  useEffect(() => {
    if (formData.parent) {
      setFormData({ ...formData, is_summable: false });
    }
  }, [formData.parent]);
  
  const structuredCategories = useDataCategoryTree(categories);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card className="w-full border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Data Categories</CardTitle>
                <CardDescription>Manage hierarchical data categories for economic sectors.</CardDescription>
              </div>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700 text-white" 
                onClick={openCreate}
                disabled={!selectedSector}
                title={!selectedSector ? "Select a sector first" : ""}
               >
                  <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
          </CardHeader>
          <CardContent>
               <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end md:items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                   <div className="w-full md:w-1/3">
                       <Label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Selected Sector</Label>
                       <select 
                        className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                       >
                           <option value="">-- Select Sector --</option>
                           {sectors.map(s => (
                               <option key={s.id} value={s.id}>{s.name}</option>
                           ))}
                       </select>
                   </div>
                   
                   <div className="relative w-full md:w-1/3">
                        <Label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input 
                                placeholder="Search categories..." 
                                className="pl-8 bg-white" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                   </div>

                   <div className="w-full md:w-1/4">
                       <Label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Status</Label>
                       <select 
                        className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                       >
                           <option value="">All Statuses</option>
                           <option value={Status.PENDING}>Pending</option>
                           <option value={Status.APPROVED}>Approved</option>
                           <option value={Status.REJECTED}>Rejected</option>
                       </select>
                   </div>
               </div>

               {categoryError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
                        Error: {categoryError}
                    </div>
                )}
                
                {!selectedSector && !isCategoryLoading && categories.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-md border border-dashed border-gray-300">
                        <Filter className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">Please select a sector to view its data categories.</p>
                    </div>
                )}

               {selectedSector && (
                   <>
                    <div className="rounded-md border shadow-sm bg-white border-gray-200">
                        <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                            <TableHead className="w-[350px]">Name</TableHead>
                            <TableHead>Parent Category</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Summable</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {structuredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                {isCategoryLoading ? "Loading categories..." : "No data categories found for this sector."}
                                </TableCell>
                            </TableRow>
                            ) : (
                                structuredCategories.map((cat) => (
                                <TableRow key={cat.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                <TableCell className="font-medium text-gray-900">
                                    <div style={{ paddingLeft: `${cat.level * 24}px` }} className="flex items-center">
                                        {cat.level > 0 && <CornerDownRight className="h-4 w-4 text-gray-400 mr-2" />}
                                        {cat.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-600">{cat.parent_name || "-"}</TableCell>
                                <TableCell>{cat.unit}</TableCell>
                                <TableCell>
                                    {!cat.parent && (
                                    <Badge variant="outline" className={cat.is_summable ? "text-green-600 bg-green-50 border-green-200" : "text-gray-500 border-gray-200"}>
                                        {cat.is_summable ? "Yes" : "No"}
                                    </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                    variant={
                                        cat.status === Status.APPROVED
                                        ? "default"
                                        : cat.status === Status.REJECTED
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className={
                                        cat.status === Status.APPROVED 
                                        ? "bg-green-100 text-green-700 hover:bg-green-100 shadow-none border border-green-200" 
                                        : cat.status === Status.REJECTED
                                        ? "bg-red-100 text-red-700 hover:bg-red-100 shadow-none border border-red-200"
                                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 shadow-none border border-yellow-200"
                                    }
                                    >
                                    {cat.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1 items-center">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEdit(cat)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(cat.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {canApprove && cat.status === Status.PENDING && (
                                            <>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(cat.id)} title="Approve">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => handleReject(cat.id)} title="Reject">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                                </TableRow>
                            ))
                            )}
                        </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-end">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                            aria-disabled={currentPage === 1}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    
                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i + 1}>
                                            <PaginationLink 
                                                href="#" 
                                                isActive={currentPage === i + 1}
                                                onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                            aria-disabled={currentPage === totalPages}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                   </>
               )}
          </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white max-w-lg">
              <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Category" : "Create Data Category"}</DialogTitle>
                  <DialogDescription>
                      {editingId ? "Update details for this data category." : "Add a new data category for the selected sector."}
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave}>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. Rice Production"
                            className="col-span-3"
                            required
                          />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="parent" className="text-right">Parent</Label>
                          <select
                            id="parent"
                            value={formData.parent}
                            onChange={(e) => setFormData({...formData, parent: e.target.value})}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                                <option value="">(None - Top Level)</option>
                                {potentialParents.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                          </select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="unit" className="text-right">Unit <span className="text-red-500">*</span></Label>
                          <Input
                            id="unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                            placeholder="e.g. MT, KG, Nos"
                            className="col-span-3"
                            required
                          />
                      </div>

                       {/* Remarks field removed */}

                       <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="related_office" className="text-right">Related Office</Label>
                           <select
                             id="related_office"
                             value={formData.related_office}
                             onChange={(e) => setFormData({...formData, related_office: e.target.value})}
                             className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                                 <option value="">(None)</option>
                                 {offices.map(o => (
                                     <option key={o.id} value={o.id}>{o.office}</option>
                                 ))}
                           </select>
                       </div>

                       <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="is_summable" className="text-right">Summable</Label>
                          <div className="col-span-3 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="is_summable"
                                checked={formData.is_summable}
                                onChange={(e) => setFormData({...formData, is_summable: e.target.checked})}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isTopLevel} 
                              />
                              <label htmlFor="is_summable" className={`text-sm ${!isTopLevel ? 'text-gray-400' : 'text-gray-600'} cursor-pointer select-none`}>
                                  values can be summed up { !isTopLevel && "(Top-level only)" }
                              </label>
                          </div>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" type="submit" disabled={isCategoryLoading}>
                          {isCategoryLoading ? "Saving..." : "Save Category"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
                <AlertDialogTitle>Delete this category?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the category and any child categories.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete Category</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};