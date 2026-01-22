import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { CreateUserPayload } from "../store/useManageUser";
import { useCommonDataStore } from "@/store/useCommonDataStore";

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
        phone_number: "",
        role: "maker",
        is_active: true,
        user_related_offices: [],
        user_provinces: [],
        user_districts: [],
        user_municipalities: []
    });

    const resetForm = () => {
        setFormData({
            staff_code: "",
            first_name: "",
            last_name: "",
            middle_name: "",
            email: "",
            phone_number: "",
            role: "maker",
            is_active: true,
            user_related_offices: [],
            user_provinces: [],
            user_districts: [],
            user_municipalities: []
        });
    };

    const {offices, fetchUserRelatedOffices, provinces, fetchProvinces} = useCommonDataStore();
    const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
    const [availableMunicipalities, setAvailableMunicipalities] = useState<any[]>([]);

    useEffect(() => {
        fetchUserRelatedOffices();
        fetchProvinces();
    }, []);

    // Fetch districts when provinces change
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!formData.user_provinces || formData.user_provinces.length === 0) {
                setAvailableDistricts([]);
                setFormData(prev => ({ ...prev, user_districts: [], user_municipalities: [] }));
                return;
            }

            try {
                // Fetch districts for each selected province
                const promises = formData.user_provinces.map(provId => 
                    apiClient.get(`/districts/?province=${provId}&page_size=100`)
                );
                const responses = await Promise.all(promises);
                const allDistricts = responses.flatMap(r => r.data.results || r.data);
                // Remove duplicates if any
                const uniqueDistricts = Array.from(new Map(allDistricts.map((item: any) => [item.id, item])).values());
                setAvailableDistricts(uniqueDistricts);
                
                // Filter out selected districts that are no longer available
                if (formData.user_districts) {
                    const validDistricts = formData.user_districts.filter(dId => uniqueDistricts.some((d: any) => Number(d.id) === Number(dId)));
                    if (validDistricts.length !== formData.user_districts.length) {
                        setFormData(prev => ({ ...prev, user_districts: validDistricts }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch districts", error);
            }
        };

        fetchDistricts();
    }, [formData.user_provinces]);

    // Fetch municipalities when districts change
    useEffect(() => {
        const fetchMunicipalities = async () => {
             if (!formData.user_districts || formData.user_districts.length === 0) {
                setAvailableMunicipalities([]);
                 setFormData(prev => ({ ...prev, user_municipalities: [] }));
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

                 // Filter out selected municipalities that are no longer available
                 if (formData.user_municipalities) {
                    const validMunicipalities = formData.user_municipalities.filter(mId => uniqueMunicipalities.some((m: any) => Number(m.id) === Number(mId)));
                     if (validMunicipalities.length !== formData.user_municipalities.length) {
                        setFormData(prev => ({ ...prev, user_municipalities: validMunicipalities }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch municipalities", error);
            }
        };
        
        fetchMunicipalities();
    }, [formData.user_districts]);

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
                <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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

                    {/* Role Selection */}
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

                    {/* Related Offices */}
                    <div className="space-y-2">
                        <Label htmlFor="related_offices">Related Offices</Label>
                        <select 
                            id="related_offices"
                            multiple
                            className="w-full h-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                            value={formData.user_related_offices?.map(String) || []}
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
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {/* Provinces */}
                        <div className="space-y-2">
                             <Label htmlFor="provinces">Province(s)</Label>
                            <select 
                                id="provinces"
                                multiple
                                className="w-full h-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                                value={formData.user_provinces?.map(String) || []}
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
                             <Label htmlFor="districts">District(s)</Label>
                            <select 
                                id="districts"
                                multiple
                                className="w-full h-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                                value={formData.user_districts?.map(String) || []}
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
                             <Label htmlFor="municipalities">Municipality(ies)</Label>
                            <select 
                                id="municipalities"
                                multiple
                                className="w-full h-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                                value={formData.user_municipalities?.map(String) || []}
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
