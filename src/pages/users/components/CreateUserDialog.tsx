import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { CreateUserPayload } from "../store/useManageUser";

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateUserPayload) => Promise<void>;
    loading: boolean;
}

export function CreateUserDialog({ open, onOpenChange, onSubmit, loading }: CreateUserDialogProps) {
    const [formData, setFormData] = useState<CreateUserPayload>({
        staff_code: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        phone_number: "",
        role: "maker",
        is_active: true
    });

    const resetForm = () => {
        setFormData({
            staff_code: "",
            first_name: "",
            last_name: "",
            middle_name: "",
            email: "",
            password: "",
            phone_number: "",
            role: "maker",
            is_active: true
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] bg-white border-none">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>Add a new user to the system.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-3">
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input id="first_name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                        </div>
                         <div className="space-y-3">
                            <Label htmlFor="middle_name">Middle Name </Label>
                            <Input id="middle_name" value={formData.middle_name || ""} onChange={e => setFormData({...formData, middle_name: e.target.value})}  />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input id="last_name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-3">
                        <Label htmlFor="staff_code">Username *</Label>
                        <Input id="staff_code" value={formData.staff_code} onChange={e => setFormData({...formData, staff_code: e.target.value})} required placeholder="EMP-XXX" />
                       </div>
                       <div className="space-y-3">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                          <div className="space-y-3">
                            <Label htmlFor="phone_number">Phone Number </Label>
                            <Input id="phone_number" value={formData.phone_number || ""} onChange={e => setFormData({...formData, phone_number: e.target.value})}  />
                        </div>
                    </div>

                    {/* Select related offices (could be multiple) To select multiple hold ctrl/cmd */}
                    {/* <div className="space-y-2">
                        <Label htmlFor="related_offices">Related Offices</Label>
                        <select 
                            id="related_offices"
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.related_offices} 
                            onChange={e => setFormData({...formData, related_offices: e.target.value})}
                        >
                            <option value="">Select Office</option>
                            <option value="office1">Office 1</option>
                            <option value="office2">Office 2</option>
                            <option value="office3">Office 3</option>
                        </select>
                    </div> */}
                    
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
