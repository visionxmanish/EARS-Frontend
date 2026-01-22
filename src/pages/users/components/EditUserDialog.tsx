import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { User, UpdateUserPayload } from "../store/useManageUser";
import { useCommonDataStore } from "@/store/useCommonDataStore";

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onSubmit: (id: number, data: UpdateUserPayload) => Promise<void>;
    loading: boolean;
}

export function EditUserDialog({ open, onOpenChange, user, onSubmit, loading }: EditUserDialogProps) {
    // Single state object for the form, initialized with defaults
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        staff_code: "",
        phone_number: "",
        role: "maker",
        is_active: true,
        user_related_offices: [] as number[],
        user_provinces: [] as number[],
        user_districts: [] as number[],
        user_municipalities: [] as number[]
    });

    const { offices, fetchUserRelatedOffices, provinces, fetchProvinces } = useCommonDataStore();
    const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
    const [availableMunicipalities, setAvailableMunicipalities] = useState<any[]>([]);

    useEffect(() => {
        fetchUserRelatedOffices();
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                middle_name: user.middle_name || "",
                email: user.email || "",
                staff_code: user.staff_code,
                phone_number: user.phone_number || "",
                role: user.role,
                is_active: user.is_active,
                // Ensure these are arrays of numbers
                user_related_offices: user.user_related_offices || [],
                user_provinces: user.user_provinces || [],
                user_districts: user.user_districts || [],
                user_municipalities: user.user_municipalities || []
            });
        }
    }, [user]);

    // Fetch districts when provinces change
    useEffect(() => {
        const fetchDistricts = async () => {
             // If no user is selected or no provinces selected, clear districts
             // But valid existing selections should be kept if possible? 
             // Logic: If user changes provinces, re-fetch.
            if (!formData.user_provinces || formData.user_provinces.length === 0) {
                setAvailableDistricts([]);
                // Only clear districts if user is actively editing? 
                // For edit mode, we might want to preserve initial values until explicitly changed?
                // Actually, standard behavior: if parent cleared, children cleared.
                 setFormData(prev => {
                     // Check if valid to clear. If strictly following CreateUserDialog logic:
                     if(prev.user_districts.length > 0) return { ...prev, user_districts: [], user_municipalities: [] };
                     return prev;
                 });
                return;
            }

            try {
                const promises = formData.user_provinces.map(provId => 
                    apiClient.get(`/districts/?province=${provId}&page_size=100`)
                );
                const responses = await Promise.all(promises);
                const allDistricts = responses.flatMap(r => r.data.results || r.data);
                const uniqueDistricts = Array.from(new Map(allDistricts.map((item: any) => [item.id, item])).values());
                setAvailableDistricts(uniqueDistricts);
                
                // Filter invalid districts
                 setFormData(prev => {
                    const validDistricts = prev.user_districts.filter(dId => uniqueDistricts.some((d: any) => Number(d.id) === Number(dId)));
                    if (validDistricts.length !== prev.user_districts.length) {
                        return { ...prev, user_districts: validDistricts };
                    }
                    return prev;
                 });

            } catch (error) {
                console.error("Failed to fetch districts", error);
            }
        };

        if (open) fetchDistricts();
    }, [formData.user_provinces, open]);

    // Fetch municipalities when districts change
    useEffect(() => {
        const fetchMunicipalities = async () => {
            if (!formData.user_districts || formData.user_districts.length === 0) {
                setAvailableMunicipalities([]);
                 setFormData(prev => {
                     if(prev.user_municipalities.length > 0) return { ...prev, user_municipalities: [] };
                     return prev;
                 });
                return;
            }

            try {
                const promises = formData.user_districts.map(distId => 
                    apiClient.get(`/municipalities/?district=${distId}&page_size=100`)
                );
                const responses = await Promise.all(promises);
                const allMunicipalities = responses.flatMap(r => r.data.results || r.data);
                const uniqueMunicipalities = Array.from(new Map(allMunicipalities.map((item: any) => [item.id, item])).values());
                setAvailableMunicipalities(uniqueMunicipalities);

                // Filter invalid municipalities
                setFormData(prev => {
                    const validMunicipalities = prev.user_municipalities.filter(mId => uniqueMunicipalities.some((m: any) => Number(m.id) === Number(mId)));
                    if (validMunicipalities.length !== prev.user_municipalities.length) {
                        return { ...prev, user_municipalities: validMunicipalities };
                    }
                    return prev;
                });
            } catch (error) {
                console.error("Failed to fetch municipalities", error);
            }
        };
        
        if(open) fetchMunicipalities();
    }, [formData.user_districts, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        await onSubmit(user.id, {
            first_name: formData.first_name,
            last_name: formData.last_name,
            middle_name: formData.middle_name,
            email: formData.email,
            phone_number: formData.phone_number,
            role: formData.role,
            is_active: formData.is_active,
            user_related_offices: formData.user_related_offices,
            user_provinces: formData.user_provinces,
            user_districts: formData.user_districts,
            user_municipalities: formData.user_municipalities
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
             <DialogContent className="sm:max-w-[800px] bg-white border-none">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Modify user details.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-3">
                            <Label htmlFor="edit_first_name">First Name *</Label>
                            <Input id="edit_first_name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                        </div>
                         <div className="space-y-3">
                            <Label htmlFor="edit_middle_name">Middle Name</Label>
                            <Input id="edit_middle_name" value={formData.middle_name} onChange={e => setFormData({...formData, middle_name: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="edit_last_name">Last Name *</Label>
                            <Input id="edit_last_name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_staff_code">Username</Label>
                            <Input id="edit_staff_code" value={formData.staff_code} disabled className="bg-gray-100" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_email">Email *</Label>
                            <Input id="edit_email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="edit_phone_number">Phone Number</Label>
                            <Input id="edit_phone_number" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                        </div>
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

                    {/* Related Offices */}
                    <div className="space-y-2">
                        <Label htmlFor="edit_related_offices">Related Offices</Label>
                        <select 
                            id="edit_related_offices"
                            multiple
                            className="w-full h-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                            value={formData.user_related_offices.map(String)}
                            onChange={(e) => {
                                const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
                                setFormData({...formData, user_related_offices: selectedOptions});
                            }}
                        >
                            {offices.map((office) => (
                                <option key={office.id} value={office.id} className="py-1 px-2 hover:bg-blue-50 cursor-pointer">
                                    {office.office}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple offices</p>
                    </div> 

                    {/* Locations */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Provinces */}
                        <div className="space-y-2">
                             <Label htmlFor="edit_provinces">Province(s)</Label>
                            <select 
                                id="edit_provinces"
                                multiple
                                className="w-full h-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                                value={formData.user_provinces.map(String)}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
                                    setFormData({...formData, user_provinces: selectedOptions});
                                }}
                            >
                                {provinces.map((province) => (
                                    <option key={province.id} value={province.id} className="py-1 px-2 hover:bg-blue-50 cursor-pointer">
                                        {province.name}
                                    </option>
                                ))}
                            </select>
                             <p className="text-[10px] text-muted-foreground">Select one or more provinces (optional)</p>
                        </div>
                        
                        {/* Districts */}
                         <div className="space-y-2">
                             <Label htmlFor="edit_districts">District(s)</Label>
                            <select 
                                id="edit_districts"
                                multiple
                                className="w-full h-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                                value={formData.user_districts.map(String)}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
                                    setFormData({...formData, user_districts: selectedOptions});
                                }}
                            >
                                {availableDistricts.map((district) => (
                                    <option key={district.id} value={district.id} className="py-1 px-2 hover:bg-blue-50 cursor-pointer">
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                             <p className="text-[10px] text-muted-foreground">Select one or more districts (optional)</p>
                        </div>

                        {/* Municipalities */}
                         <div className="space-y-2">
                             <Label htmlFor="edit_municipalities">Municipality(ies)</Label>
                            <select 
                                id="edit_municipalities"
                                multiple
                                className="w-full h-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                                value={formData.user_municipalities.map(String)}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
                                    setFormData({...formData, user_municipalities: selectedOptions});
                                }}
                            >
                                {availableMunicipalities.map((muni) => (
                                    <option key={muni.id} value={muni.id} className="py-1 px-2 hover:bg-blue-50 cursor-pointer">
                                        {muni.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-muted-foreground">Select one or more municipalities (optional)</p>
                        </div>
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </form>
             </DialogContent>
         </Dialog>
    );
}
