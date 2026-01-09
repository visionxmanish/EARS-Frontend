import { useEffect, useState } from "react";
import { useUserStore, type User, type CreateUserPayload, type UpdateUserPayload } from "./store/useManageUser";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Plus, Pencil, Trash2, Search,
} from "lucide-react";

export default function ManageUsersPage() {
    // Fixed: isLoading -> loading
    const { users, loading, error, fetchUsers, createUser, updateUser, deleteUser, currentPage, totalPages } = useUserStore();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all"); 
    
    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form States
    const [formData, setFormData] = useState<CreateUserPayload>({
        staff_code: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "maker",
        is_active: true
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers({ 
                search, 
                role: roleFilter !== 'all' ? roleFilter : undefined,
                page: 1 
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, roleFilter]);

    const handlePageChange = (page: number) => {
        fetchUsers({ 
            search, 
            role: roleFilter !== 'all' ? roleFilter : undefined,
            page 
        });
    };

    const resetForm = () => {
        setFormData({
            staff_code: "",
            first_name: "",
            last_name: "",
            middle_name: "",
            email: "",
            password: "",
            role: "maker",
            is_active: true
        });
    };

    const handleCreateOpen = () => {
        resetForm();
        setIsCreateOpen(true);
    };

    const handleEditOpen = (user: User) => {
        setSelectedUser(user);
        setFormData({
            staff_code: user.staff_code,
            first_name: user.first_name,
            last_name: user.last_name,
            middle_name: user.middle_name,
            email: user.email || "",
            role: user.role,
            is_active: user.is_active
        });
        setIsEditOpen(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUser(formData);
            setIsCreateOpen(false);
            resetForm();
        } catch (err) {
            // Error handling is managed by store
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            const updatePayload: UpdateUserPayload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                role: formData.role,
                is_active: formData.is_active,
            };
            await updateUser(selectedUser.id, updatePayload);
            setIsEditOpen(false);
            setSelectedUser(null);
        } catch (err) {
            // Error handling is managed by store
        }
    };

    const handleDelete = async (user: User) => {
        if (confirm(`Are you sure you want to delete user ${user.full_name}?`)) {
            await deleteUser(user.id);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto bg-white">
             <Card className="w-full border-none shadow-sm">
                 <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">Manage Users</CardTitle>
                        <CardDescription>View and manage system users and their roles.</CardDescription>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateOpen}>
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                 </CardHeader>
                 
                 <CardContent className="bg-white">
                     {/* Filters */}
                     <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
                         <div className="relative w-full md:w-96">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input 
                                placeholder="Search by name, email or staff code..." 
                                className="pl-8 bg-white border-gray-200 focus-visible:ring-blue-500" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                            />
                         </div>
                         <div className="flex items-center gap-2 w-full md:w-auto">
                            <select 
                                className="h-10 w-[180px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={roleFilter} 
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="checker">Checker</option>
                                <option value="maker">Maker</option>
                            </select>
                         </div>
                     </div>

                     {/* Error Message */}
                     {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-100">
                            {error}
                        </div>
                     )}
                     
                     {/* Table */}
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
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEditOpen(u)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(u)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                         </Table>
                     </div>
                     
                     {/* Pagination */}
                     {totalPages > 1 && (
                        <div className="mt-4 flex justify-end">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                    <PaginationItem><PaginationLink isActive>{currentPage}</PaginationLink></PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext 
                                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                     )}
                 </CardContent>
             </Card>

             {/* Create Dialog */}
             <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[800px] bg-white border-none">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>Add a new user to the system.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-3">
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input id="first_name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                            </div>
                             <div className="space-y-3">
                                <Label htmlFor="first_name">Middle Name </Label>
                                <Input id="first_name" value={formData.middle_name? formData.middle_name : ""} onChange={e => setFormData({...formData, middle_name: e.target.value})}  />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input id="last_name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="staff_code">Username *</Label>
                            <Input id="staff_code" value={formData.staff_code} onChange={e => setFormData({...formData, staff_code: e.target.value})} required placeholder="EMP-XXX" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input id="password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <select 
                                id="role"
                                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.role} 
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="maker">Maker</option>
                                <option value="checker">Checker</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="is_active" 
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={formData.is_active} 
                                onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                            />
                            <Label htmlFor="is_active">Active Account</Label>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
             </Dialog>

             {/* Edit Dialog */}
             <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                 <DialogContent className="sm:max-w-[425px] bg-white border-none">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Modify user details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_first_name">First Name</Label>
                                <Input id="edit_first_name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_last_name">Last Name</Label>
                                <Input id="edit_last_name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_staff_code">Staff Code</Label>
                            <Input id="edit_staff_code" value={formData.staff_code} disabled className="bg-gray-100" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_email">Email</Label>
                            <Input id="edit_email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_role">Role</Label>
                            <select 
                                id="edit_role"
                                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.role} 
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="maker">Maker</option>
                                <option value="checker">Checker</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                             <input 
                                type="checkbox" 
                                id="edit_is_active" 
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={formData.is_active} 
                                onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                            />
                            <Label htmlFor="edit_is_active">Active Account</Label>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                        </DialogFooter>
                    </form>
                 </DialogContent>
             </Dialog>
        </div>
    );
}