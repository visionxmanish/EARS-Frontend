import { useEffect, useState } from "react";
import { useUserStore, type User, type CreateUserPayload, type UpdateUserPayload } from "./store/useManageUser";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { UserFilters } from "./components/UserFilters";
import { UserTable } from "./components/UserTable";
import { CreateUserDialog } from "./components/CreateUserDialog";
import { EditUserDialog } from "./components/EditUserDialog";

export default function ManageUsersPage() {
    const { users, loading, error, fetchUsers, createUser, updateUser, deleteUser, currentPage, totalPages } = useUserStore();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all"); 
    
    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

    const handleCreateOpen = () => {
        setIsCreateOpen(true);
    };

    const handleEditOpen = (user: User) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleCreateSubmit = async (data: CreateUserPayload) => {
        try {
            await createUser(data);
            setIsCreateOpen(false);
        } catch (err) {
            // Error handling is managed by store
        }
    };

    const handleEditSubmit = async (id: number, data: UpdateUserPayload) => {
        try {
            await updateUser(id, data);
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
                     <UserFilters 
                        search={search} 
                        onSearchChange={setSearch} 
                        roleFilter={roleFilter} 
                        onRoleFilterChange={setRoleFilter} 
                     />

                     {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-100">
                            {error}
                        </div>
                     )}
                     
                     <UserTable 
                        users={users} 
                        loading={loading} 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                        onEdit={handleEditOpen} 
                        onDelete={handleDelete} 
                     />
                 </CardContent>
             </Card>

             <CreateUserDialog 
                open={isCreateOpen} 
                onOpenChange={setIsCreateOpen} 
                onSubmit={handleCreateSubmit} 
                loading={loading} 
             />

             <EditUserDialog 
                open={isEditOpen} 
                onOpenChange={setIsEditOpen} 
                user={selectedUser} 
                onSubmit={handleEditSubmit} 
                loading={loading} 
             />
        </div>
    );
}