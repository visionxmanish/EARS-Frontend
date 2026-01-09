import apiClient from "@/lib/axios";
import { create } from "zustand";

export interface User {
    id: number;
    staff_code: string;
    username: string | null;
    email: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    full_name: string;
    phone_number: string | null;
    role: string;
    is_active: boolean;
    is_staff: boolean;
    gender: string | null;
    profile_picture: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateUserPayload {
    staff_code: string;
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    role: string;
    is_active?: boolean;
}

export interface UpdateUserPayload {
    role?: string;
    is_active?: boolean;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
}

interface UserState {
    users: User[];
    loading: boolean;
    error: string | null;
    
    // Pagination
    currentPage: number;
    totalPages: number;
    totalItems: number;

    fetchUsers: (params?: { search?: string; role?: string; page?: number }) => Promise<void>;
    createUser: (user: CreateUserPayload) => Promise<void>;
    updateUser: (id: number, user: UpdateUserPayload) => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,

    fetchUsers: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.get('/users/', { params });
            
            if (response.data.results) {
                set({ 
                    users: response.data.results,
                    totalItems: response.data.count,
                    totalPages: Math.ceil(response.data.count / 20),
                    currentPage: params.page || 1
                });
            } else {
                // Handle non-paginated response if any (though API implies pagination)
                set({ 
                    users: Array.isArray(response.data) ? response.data : [],
                    totalItems: Array.isArray(response.data) ? response.data.length : 0,
                    totalPages: 1,
                    currentPage: 1
                });
            }
        } catch (error: any) {
             const errorMsg = error.response?.data?.detail || error.message || 'Failed to fetch users';
            set({ error: errorMsg });
        } finally {
            set({ loading: false });
        }
    },

    createUser: async (userData: CreateUserPayload) => {
        set({ loading: true, error: null });
        try {
            await apiClient.post('/users/', userData);
            await get().fetchUsers({ page: get().currentPage });
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || error.message || 'Failed to create user';
            set({ error: errorMsg });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updateUser: async (id: number, userData: UpdateUserPayload) => {
        set({ loading: true, error: null });
        try {
            await apiClient.patch(`/users/${id}/`, userData);
            await get().fetchUsers({ page: get().currentPage });
        } catch (error: any) {
             const errorMsg = error.response?.data?.detail || error.message || 'Failed to update user';
            set({ error: errorMsg });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deleteUser: async (id: number) => {
        set({ loading: true, error: null });
        try {
            await apiClient.delete(`/users/${id}/`);
            await get().fetchUsers({ page: get().currentPage });
        } catch (error: any) {
             const errorMsg = error.response?.data?.detail || error.message || 'Failed to delete user';
            set({ error: errorMsg });
            throw error;
        } finally {
            set({ loading: false });
        }
    },
}));
