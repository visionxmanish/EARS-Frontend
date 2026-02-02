import { useEffect, useState } from "react";
import { useEconomicDataStore, type EconomicDataProgress } from "./store/useEconomicDataStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";
import { Status } from "@/constants/enum/statusEnum";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { AddEconomicData } from "./components/addEconomicData";
import { ViewEconomicDataDialog } from "./components/viewEconomicDataDialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function ManageEconomicDataPage() {
  const {
    progressList,
    isLoadingList,
    errorList,
    fetchProgressList,
    approveProgress,
    deleteProgress,
    currentPage,
    totalPages,
  } = useEconomicDataStore();
  
  const { user } = useAuthStore();
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState<EconomicDataProgress | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    fetchProgressList({ page: 1 });
  }, []);

  const handlePageChange = (page: number) => {
      if (page < 1 || page > totalPages) return;
      fetchProgressList({ page });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete?")) {
      await deleteProgress(id);
    }
  };

  const handleApprove = async (id: number) => {
       if (confirm("Are you sure you want to approve?")) {
           await approveProgress(id);
       }
  };

  const handleView = (item: EconomicDataProgress) => {
      setSelectedProgress(item);
      setIsViewOpen(true);
  }

  const canApprove = user?.role === 'checker' || user?.role === 'admin';

  if (isAddMode) {
      return (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Add Economic Data</h1>
                  <Button variant="outline" onClick={() => setIsAddMode(false)}>Cancel</Button>
              </div>
              <AddEconomicData />
          </div>
      )
  }

  return (
    <div className="space-y-6 w-full">
        <div className="flex flex-row justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Manage Economic Data</h1>
            <div className="flex flex-row gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddMode(true)}>
                    Add New
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => console.log("Upload Excel")}>
                    Upload Excel
                </Button>
            </div>
        </div>

        {errorList && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                {errorList}
            </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50/75">
                    <TableRow>
                        <TableHead className="w-[50px]">S.N</TableHead>
                        <TableHead className="w-[50px]">View</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Fiscal Year</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Report Type</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Approved At</TableHead>
                        <TableHead>Approve</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoadingList ? (
                         <TableRow>
                            <TableCell colSpan={13} className="text-center h-48 text-muted-foreground">
                                Loading economic data...
                            </TableCell>
                        </TableRow>
                    ) : progressList.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={13} className="text-center h-48 text-muted-foreground">
                                No economic data entries found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        progressList.map((item, index) => (
                            <TableRow key={item.id} className="hover:bg-gray-50/50 border-b border-gray-100">
                                <TableCell>{(currentPage - 1) * 20 + index + 1}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleView(item)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                                <TableCell>{item.created_by_name}</TableCell>
                                <TableCell>{item.fiscal_year_name}</TableCell>
                                <TableCell>{item.municipality_name || item.district_name || item.province_name}</TableCell>
                                <TableCell>{item.sector_name}</TableCell>
                                <TableCell>{item.report_type_name}</TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-gray-500">
                                    {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant="outline" 
                                        className={
                                            item.status === Status.APPROVED ? "bg-green-50 text-green-700 border-green-200" :
                                            item.status === Status.REJECTED ? "bg-red-50 text-red-700 border-red-200" :
                                            "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        }
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.approved_by_name || '-'}</TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-gray-500">
                                    {item.approved_at ? format(new Date(item.approved_at), 'MMM dd, yyyy') : '-'}
                                </TableCell>
                                <TableCell>
                                    {canApprove && item.status === Status.PENDING && (
                                         <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                            onClick={() => handleApprove(item.id)}
                                        >
                                            Approve
                                        </Button>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex justify-end mt-4">
                 <Pagination>
                    <PaginationContent>
                        {/* First Page */}
                        <PaginationItem>
                            <PaginationLink 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handlePageChange(1); }}
                                aria-disabled={currentPage === 1}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            > 
                            First
                            </PaginationLink>

                            
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationPrevious 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                aria-disabled={currentPage === 1}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        
                        {[currentPage, currentPage + 1].filter(page => page <= totalPages).map((pageNumber) => (
                            <PaginationItem key={pageNumber}>
                                <PaginationLink
                                    href="#"
                                    isActive={currentPage === pageNumber}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(pageNumber);
                                    }}
                                    className={currentPage === pageNumber ? "bg-blue-600 text-white" : "cursor-pointer"}
                                >
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        

                        <PaginationItem>
                            <PaginationNext 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                aria-disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>

                         {/* Last Page */}
                        <PaginationItem>
                            <PaginationLink 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}
                                aria-disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            > 
                            Last
                            </PaginationLink>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        )}

        <ViewEconomicDataDialog 
            open={isViewOpen} 
            onOpenChange={setIsViewOpen} 
            progress={selectedProgress} 
        />
    </div>
  );
}