import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    roleFilter: string;
    onRoleFilterChange: (value: string) => void;
}

export function UserFilters({ search, onSearchChange, roleFilter, onRoleFilterChange }: UserFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                    placeholder="Search by name, email or staff code..." 
                    className="pl-8 bg-white border-gray-200 focus-visible:ring-blue-500" 
                    value={search} 
                    onChange={e => onSearchChange(e.target.value)} 
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <select 
                    className="h-10 w-[180px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={roleFilter} 
                    onChange={(e) => onRoleFilterChange(e.target.value)}
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="checker">Checker</option>
                    <option value="maker">Maker</option>
                </select>
            </div>
        </div>
    );
}
