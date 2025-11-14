// src/store/contactsStore.ts
import {
    DocumentData,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { create } from 'zustand';
import {
    ContactDoc,
    contactService,
    ContactStatusFilter,
} from '../services/firebase/contactService';

type ContactsState = {
    items: ContactDoc[];
    statusFilter: ContactStatusFilter;
    cursor: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
    loadingInitial: boolean;
    loadingMore: boolean;
    tenantId: string | null;

    // actions
    setStatusFilter: (status: ContactStatusFilter) => void;
    reset: () => void;
    fetchInitial: (tenantId: string) => Promise<void>;
    fetchMore: () => Promise<void>;
};

export const useContactsStore = create<ContactsState>((set, get) => ({
    items: [],
    statusFilter: 'active',
    cursor: null,
    hasMore: true,
    loadingInitial: false,
    loadingMore: false,
    tenantId: null,

    setStatusFilter: (status) => {
        set({ statusFilter: status });
        const currentTenant = get().tenantId;
        if (currentTenant) {
            // recarrega do zero com o novo filtro
            get().fetchInitial(currentTenant);
        }
    },

    reset: () => {
        set({
            items: [],
            cursor: null,
            hasMore: true,
            loadingInitial: false,
            loadingMore: false,
            tenantId: null,
            statusFilter: 'active',
        });
    },

    fetchInitial: async (tenantId: string) => {
        const { statusFilter, loadingInitial } = get();
        if (loadingInitial) return;

        set({
            loadingInitial: true,
            tenantId,
            cursor: null,
            hasMore: true,
            items: [],
        });

        try {
            const result = await contactService.listContactsByTenantPaged({
                tenantId,
                status: statusFilter,
                cursor: null,
                pageSize: 12,
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
            statusFilter,
            cursor,
            hasMore,
            loadingMore,
            loadingInitial,
        } = get();

        if (!tenantId) return;
        if (!hasMore || loadingMore || loadingInitial) return;

        set({ loadingMore: true });

        try {
            const result = await contactService.listContactsByTenantPaged({
                tenantId,
                status: statusFilter,
                cursor,
                pageSize: 12,
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
}));
