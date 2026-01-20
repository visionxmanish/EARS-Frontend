import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Pencil, Trash2 } from "lucide-react";
import type { User } from "../store/useManageUser";

interface UserTableProps {
    users: User[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export function UserTable({ users, loading, currentPage, totalPages, onPageChange, onEdit, onDelete }: UserTableProps) {
    return (
        <div className="rounded-md border border-gray-100 overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-[50px] font-semibold text-gray-600">S.N</TableHead>
                        <TableHead className="font-semibold text-gray-600">User Details</TableHead>
                        <TableHead className="font-semibold text-gray-600">Staff Code</TableHead>
                        <TableHead className="font-semibold text-gray-600">Role</TableHead>
                        <TableHead className="font-semibold text-gray-600">Status</TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                <div className="flex justify-center items-center gap-2 text-gray-500">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Loading users...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : users.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-24 text-center text-gray-500">No users found.</TableCell></TableRow>
                    ) : (
                        users.map((u, index) => (
                            <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors border-gray-100 hover:bg-gray-50/50">
                                <TableCell className="text-gray-500">{(currentPage - 1) * 20 + index + 1}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                            {(u.first_name?.[0] || '')}{(u.last_name?.[0] || '')}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{u.full_name}</span>
                                            <span className="text-xs text-gray-500">{u.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-600 font-mono text-sm">{u.staff_code}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`capitalize
                                        ${u.role === 'admin' ? 'border-purple-200 bg-purple-50 text-purple-700' : 
                                          u.role === 'checker' ? 'border-orange-200 bg-orange-50 text-orange-700' : 
                                          'border-blue-200 bg-blue-50 text-blue-700'
                                        }
                                    `}>
                                        {u.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`
                                        ${u.is_active 
                                            ? 'border-green-200 bg-green-50 text-green-700' 
                                            : 'border-gray-200 bg-gray-50 text-gray-500'
                                        }
                                    `}>
                                        {u.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => onEdit(u)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(u)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            
            {totalPages > 1 && (
                <div className="mt-4 flex justify-end p-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            <PaginationItem><PaginationLink isActive>{currentPage}</PaginationLink></PaginationItem>
                            <PaginationItem>
                                <PaginationNext 
                                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
