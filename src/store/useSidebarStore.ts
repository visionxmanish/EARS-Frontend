import { create } from "zustand";

interface SidebarState {
    activeItem: string;
    setActiveItem(item: string): void;
}


export const useSidebarStore = create<SidebarState>((set, _) => ({
    activeItem: '/',
    setActiveItem: (item: string) => set({ activeItem: item }),
}))