import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { User, UpdateUserPayload } from "../store/useManageUser";

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onSubmit: (id: number, data: UpdateUserPayload) => Promise<void>;
    loading: boolean;
}

export function EditUserDialog({ open, onOpenChange, user, onSubmit, loading }: EditUserDialogProps) {
    const [formData, setFormData] = useState<UpdateUserPayload>({});
    
    // We also need to keep track of fields that are read-only for display or pre-filled
    const [displayData, setDisplayData] = useState({
        staff_code: "",
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        phone_number: "",
        role: "maker",
        is_active: true
    });

    useEffect(() => {
        if (user) {
            setDisplayData({
                staff_code: user.staff_code,
                first_name: user.first_name,
                last_name: user.last_name,
                middle_name: user.middle_name || "",
                email: user.email || "",
                phone_number: user.phone_number || "",
                role: user.role,
                is_active: user.is_active
            });
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email || undefined,
                role: user.role,
                is_active: user.is_active,
                phone_number: user.phone_number || undefined,
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        await onSubmit(user.id, {
            ...formData,
            // Ensure we use the latest values from displayData if they match what we want to send,
            // or just use formData. The parent component's logic was a bit mixed, 
            // so we'll reconstruct the payload cleanly.
            first_name: displayData.first_name,
            last_name: displayData.last_name,
            email: displayData.email,
            role: displayData.role,
            is_active: displayData.is_active,
            phone_number: displayData.phone_number || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
             <DialogContent className="sm:max-w-[425px] bg-white border-none">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Modify user details.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_first_name">First Name</Label>
                            <Input id="edit_first_name" value={displayData.first_name} onChange={e => setDisplayData({...displayData, first_name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_last_name">Last Name</Label>
                            <Input id="edit_last_name" value={displayData.last_name} onChange={e => setDisplayData({...displayData, last_name: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_staff_code">Staff Code</Label>
                        <Input id="edit_staff_code" value={displayData.staff_code} disabled className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_email">Email</Label>
                        <Input id="edit_email" type="email" value={displayData.email} onChange={e => setDisplayData({...displayData, email: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="edit_phone_number">Phone Number</Label>
                        <Input id="edit_phone_number" value={displayData.phone_number} onChange={e => setDisplayData({...displayData, phone_number: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_role">Role</Label>
                        <select 
                            id="edit_role"
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={displayData.role} 
                            onChange={(e) => setDisplayData({...displayData, role: e.target.value})}
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
                            checked={displayData.is_active} 
                            onChange={e => setDisplayData({...displayData, is_active: e.target.checked})} 
                        />
                        <Label htmlFor="edit_is_active">Active Account</Label>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </form>
             </DialogContent>
         </Dialog>
    );
}
