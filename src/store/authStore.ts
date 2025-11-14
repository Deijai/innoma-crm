// src/store/authStore.ts
import type { User } from 'firebase/auth';
import { create } from 'zustand';
import { authService } from '../services/firebase/authService';
import { UserDoc, userService } from '../services/firebase/userService';

interface AuthState {
    user: UserDoc | null;
    loading: boolean;
    initialized: boolean;

    initAuthListener: () => void;

    registerMaster: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: false,
    initialized: false,

    initAuthListener: () => {
        const already = get().initialized;
        if (already) return;

        authService.listenAuthChanges(async (fbUser: User | null) => {
            if (!fbUser) {
                set({ user: null, initialized: true });
                return;
            }

            const doc = await userService.getUser(fbUser.uid);
            set({
                user: doc,
                initialized: true,
            });
        });
    },

    registerMaster: async (name, email, password) => {
        set({ loading: true });
        try {
            const fbUser = await authService.registerWithEmail(email, password);

            const userDoc = await userService.createUser(fbUser.uid, {
                name,
                email,
                role: 'MASTER',
                tenantId: null,
                isActive: true,
            });

            set({ user: userDoc });
        } finally {
            set({ loading: false });
        }
    },

    login: async (email, password) => {
        set({ loading: true });
        try {
            const fbUser = await authService.login(email, password);
            const userDoc = await userService.getUser(fbUser.uid);

            set({ user: userDoc });
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        await authService.logout();
        set({ user: null });
    },
}));
