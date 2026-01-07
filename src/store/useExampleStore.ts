import { create } from 'zustand';

// Example store interface
interface ExampleState {
  count: number;
  user: { name: string; email: string } | null;
  isLoading: boolean;
  increment: () => void;
  decrement: () => void;
  setUser: (user: { name: string; email: string } | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Create the store
export const useExampleStore = create<ExampleState>((set) => ({
  // Initial state
  count: 0,
  user: null,
  isLoading: false,

  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ count: 0, user: null, isLoading: false }),
}));

