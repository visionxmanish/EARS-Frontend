import { useEffect, useState } from "react";
import { useUserRelatedOfficeStore, type UserRelatedOffice } from "@/store/useUserRelatedOfficeStore";
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
import { Pencil, Trash2, CheckCircle, XCircle, Plus, Search } from "lucide-react";

export default function OfficePage() {
  const {
    offices,
    isLoading,
    error,
    currentPage,
    totalPages,
    fetchUserRelatedOffices,
    createOffice,
    deleteOffice,
    approveOffice,
    rejectOffice,
    updateOffice,
  } = useUserRelatedOfficeStore();
  
  const { user } = useAuthStore();
  
  // State for Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
      office: "",
  });
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // State for Delete Alert
  const [deleteId, setDeleteId] = useState<number | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUserRelatedOffices({ page: 1, search: searchQuery, status: statusFilter });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, fetchUserRelatedOffices]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchUserRelatedOffices({ page, search: searchQuery, status: statusFilter });
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ office: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (office: UserRelatedOffice) => {
    setEditingId(office.id);
    setFormData({
        office: office.office,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.office) return;
    
    try {
        if (editingId) {
            await updateOffice(editingId, formData);
        } else {
            await createOffice(formData);
        }
        setIsDialogOpen(false);
        setFormData({ office: "" });
        setEditingId(null);
    } catch (err) {
        // Error is handled in store and displayed in UI
    }
  };

  const confirmDelete = async () => {
      if (deleteId) {
          try {
              await deleteOffice(deleteId);
              setDeleteId(null);
          } catch(err) {
              // Error handled in store
          }
      }
  }

  const handleApprove = async (id: number) => {
      if (confirm("Are you sure you want to approve?")) {
          await approveOffice(id);
      }
  };

  const handleReject = async (id: number) => {
      if (confirm("Are you sure you want to reject?")) {
        await rejectOffice(id);
      }
  };

  // Helper to check permissions
  const canApprove = user?.role === 'checker' || user?.role === 'admin'; 

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card className="w-full border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Manage User Related Offices</CardTitle>
                <CardDescription>Create, update, and manage offices for user relations.</CardDescription>
              </div>
              <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" /> Create Office
              </Button>
          </CardHeader>
          <CardContent>
               <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                   <div className="relative w-full md:w-96">
                        <Label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input 
                                placeholder="Search offices..." 
                                className="pl-8 bg-white" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                   </div>
                   <div className="w-full md:w-auto">
                        <Label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Status</Label>
                       <select 
                        className="h-10 w-full md:w-48 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

               {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
                        Error: {error}
                    </div>
                )}

              <div className="rounded-md border shadow-sm bg-white border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[300px]">Office Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                          {isLoading ? "Loading offices..." : "No offices found matching your criteria."}
                        </TableCell>
                      </TableRow>
                    ) : (
                        offices.map((office) => (
                        <TableRow key={office.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <TableCell className="font-medium text-gray-900">{office.office}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                office.status === Status.APPROVED
                                  ? "default"
                                  : office.status === Status.REJECTED
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={
                                  office.status === Status.APPROVED 
                                  ? "bg-green-100 text-green-700 hover:bg-green-100 shadow-none border border-green-200" 
                                  : office.status === Status.REJECTED
                                  ? "bg-red-100 text-red-700 hover:bg-red-100 shadow-none border border-red-200"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 shadow-none border border-yellow-200"
                              }
                            >
                              {office.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                              <div>{office.created_by_name || "Unknown"}</div>
                              <div className="text-[10px]">{office.created_at ? new Date(office.created_at).toLocaleDateString() : "-"}</div>
                          </TableCell>
                          <TableCell className="text-right">
                              <div className="flex justify-end gap-1 items-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEdit(office)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(office.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                {canApprove && office.status === Status.PENDING && (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(office.id)} title="Approve">
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => handleReject(office.id)} title="Reject">
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
          </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white">
              <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Office" : "Create New Office"}</DialogTitle>
                  <DialogDescription>
                      {editingId ? "Update the details of this office." : "Add a new office to the system."}
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave}>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="office" className="text-right">Office Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="office"
                            value={formData.office}
                            onChange={(e) => setFormData({...formData, office: e.target.value})}
                            placeholder="e.g. Department of Agriculture"
                            className="col-span-3"
                            required
                          />
                      </div>
                  </div>
                  <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Office"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
        
      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
                <AlertDialogTitle>Delete this office?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user related office.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete Office</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}