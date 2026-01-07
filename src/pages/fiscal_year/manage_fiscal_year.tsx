import { useEffect, useState } from "react";
import { useFiscalStore, type FiscalYear } from "./store/useFiscalStore";
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
import { Pencil, Trash2, CheckCircle, XCircle, Plus } from "lucide-react";

export default function ManageFiscalYear() {
  const {
    fiscalYears,
    isLoading,
    error,
    currentPage,
    totalPages,
    fetchFiscalYears,
    createFiscalYear,
    deleteFiscalYear,
    approveFiscalYear,
    rejectFiscalYear,
    updateFiscalYear,
  } = useFiscalStore();
  
  const { user } = useAuthStore();
  
  // State for Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [yearInput, setYearInput] = useState("");
  
  // State for Delete Alert
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchFiscalYears({ page: currentPage });
  }, [fetchFiscalYears, currentPage]); 
  
  const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
          fetchFiscalYears({ page });
      }
  }

  const openCreate = () => {
    setEditingId(null);
    setYearInput("");
    setIsDialogOpen(true);
  };

  const openEdit = (fy: FiscalYear) => {
    setEditingId(fy.id);
    setYearInput(fy.year);
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearInput) return;
    
    try {
        if (editingId) {
            await updateFiscalYear(editingId, yearInput);
        } else {
            await createFiscalYear(yearInput);
        }
        setIsDialogOpen(false);
        setYearInput("");
        setEditingId(null);
    } catch (err) {
        // Error is handled in store and displayed in UI
    }
  };

  const confirmDelete = async () => {
      if (deleteId) {
          try {
              await deleteFiscalYear(deleteId);
              setDeleteId(null);
          } catch(err) {
              // Error handled in store
          }
      }
  }

  const handleApprove = async (id: number) => {
      if (confirm("Are you sure you want to approve?")) {
          await approveFiscalYear(id);
      }
  };

  const handleReject = async (id: number) => {
      if (confirm("Are you sure you want to reject?")) {
        await rejectFiscalYear(id);
      }
  };

  // Helper to check permissions
  const canApprove = user?.role === 'checker' || user?.role === 'admin'; 

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card className="w-full border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Fiscal Years</CardTitle>
                <CardDescription>Create, update, and manage fiscal years.</CardDescription>
              </div>
              <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Create Fiscal Year
              </Button>
          </CardHeader>
          <CardContent >
               {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                        Error: {error}
                    </div>
                )}

              <div className="rounded-md border shadow-lg bg-white border-gray-200 p-3">
                <Table>
                  <TableHeader className="bg-[#f6f8fb]">
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Approved At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fiscalYears.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          {isLoading ? "Loading..." : "No fiscal years found."}
                        </TableCell>
                      </TableRow>
                    ) : (
                        fiscalYears.map((fy) => (
                        <TableRow key={fy.id} className="border-b border-gray-200">
                          <TableCell className="font-medium">{fy.year}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                fy.status === Status.APPROVED
                                  ? "default"
                                  : fy.status === Status.REJECTED
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={
                                  fy.status === Status.APPROVED ? "bg-green-600 hover:bg-green-700 text-white" : ""
                              }
                            >
                              {fy.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{fy.created_by_name || fy.created_by}</TableCell>
                          <TableCell>{fy.approved_by_name || (fy.approved_by ? fy.approved_by : "-")}</TableCell>
                          <TableCell>{fy.approved_at ? new Date(fy.approved_at).toLocaleDateString() : "-"}</TableCell>
                          <TableCell className="text-right flex justify-end gap-2 items-center">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(fy)}>
                                <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(fy.id)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                            {canApprove && fy.status === Status.PENDING && (
                                <>
                                    <Button variant="ghost" size="icon" onClick={() => handleApprove(fy.id)} title="Approve">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleReject(fy.id)} title="Reject">
                                        <XCircle className="h-4 w-4 text-orange-600" />
                                    </Button>
                                </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                  <div className="mt-4">
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
          <DialogContent className="bg-white border-none">
              <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Fiscal Year" : "Create Fiscal Year"}</DialogTitle>
                  <DialogDescription>
                      {editingId ? "Update the fiscal year details." : "Enter the new fiscal year to add to the system."}
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave}>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="year" className="text-right">Year</Label>
                         <Input
                            id="year"
                            value={yearInput}
                            onChange={(e) => setYearInput(e.target.value)}
                            placeholder="e.g. 2081/82"
                            className="col-span-3 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />

                      </div>
                  </div>
                  <DialogFooter>
                      <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save changes"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-none">
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the fiscal year.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}