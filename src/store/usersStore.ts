// src/store/usersStore.ts
import {
    DocumentData,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { create } from 'zustand';
import {
    UserInviteDoc,
    userInviteService,
} from '../services/firebase/userInviteService';
import {
    UserDoc,
    userService,
} from '../services/firebase/userService';

type UsersState = {
    items: UserDoc[];
    cursor: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
    loadingInitial: boolean;
    loadingMore: boolean;
    tenantId: string | null;

    invites: UserInviteDoc[];
    invitesLoading: boolean;

    // actions
    reset: () => void;
    fetchInitial: (tenantId: string) => Promise<void>;
    fetchMore: () => Promise<void>;
    loadInvites: (tenantId: string) => Promise<void>;
};

export const useUsersStore = create<UsersState>((set, get) => ({
    items: [],
    cursor: null,
    hasMore: true,
    loadingInitial: false,
    loadingMore: false,
    tenantId: null,

    invites: [],
    invitesLoading: false,

    reset: () => {
        set({
            items: [],
            cursor: null,
            hasMore: true,
            loadingInitial: false,
            loadingMore: false,
            tenantId: null,
            invites: [],
            invitesLoading: false,
        });
    },

    fetchInitial: async (tenantId: string) => {
        const { loadingInitial } = get();
        if (loadingInitial) return;

        set({
            loadingInitial: true,
            tenantId,
            cursor: null,
            hasMore: true,
            items: [],
        });

        try {
            const result = await userService.listUsersByTenantPaged({
                tenantId,
                cursor: null,
                pageSize: 12,
                onlyActive: false,
            });

            set({
                items: result.items,
                cursor: result.cursor,
                hasMore: result.hasMore,
            });
        } finally {
            set({ loadingInitial: false });
        }
    },

    fetchMore: async () => {
        const {
            tenantId,
            cursor,
            hasMore,
            loadingMore,
            loadingInitial,
        } = get();

        if (!tenantId) return;
        if (!hasMore || loadingMore || loadingInitial) return;

        set({ loadingMore: true });

        try {
            const result = await userService.listUsersByTenantPaged({
                tenantId,
                cursor,
                pageSize: 12,
                onlyActive: false,
            });

            set((state) => ({
                items: [...state.items, ...result.items],
                cursor: result.cursor,
                hasMore: result.hasMore,
            }));
        } finally {
            set({ loadingMore: false });
        }
    },

    loadInvites: async (tenantId: string) => {
        set({ invitesLoading: true });
        try {
            const data = await userInviteService.listInvitesByTenant(
                tenantId,
            );
            set({
                invites: data.filter((i) => !i.isUsed),
            });
        } finally {
            set({ invitesLoading: false });
        }
    },
}));
