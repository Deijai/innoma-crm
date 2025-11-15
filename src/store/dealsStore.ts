// src/store/dealsStore.ts
import {
    DocumentData,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { create } from 'zustand';
import {
    DealDoc,
    dealService,
    DealStage,
} from '../services/firebase/dealService';

export type StageFilter = DealStage | 'all';

type DealsState = {
    items: DealDoc[];
    stageFilter: StageFilter;
    cursor: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
    loadingInitial: boolean;
    loadingMore: boolean;
    tenantId: string | null;

    setStageFilter: (stage: StageFilter) => void;
    reset: () => void;
    fetchInitial: (tenantId: string) => Promise<void>;
    fetchMore: () => Promise<void>;
};

export const useDealsStore = create<DealsState>((set, get) => ({
    items: [],
    stageFilter: 'all',
    cursor: null,
    hasMore: true,
    loadingInitial: false,
    loadingMore: false,
    tenantId: null,

    setStageFilter: (stage) => {
        set({ stageFilter: stage });
        const currentTenant = get().tenantId;
        if (currentTenant) {
            get().fetchInitial(currentTenant);
        }
    },

    reset: () => {
        set({
            items: [],
            stageFilter: 'all',
            cursor: null,
            hasMore: true,
            loadingInitial: false,
            loadingMore: false,
            tenantId: null,
        });
    },

    fetchInitial: async (tenantId: string) => {
        const { stageFilter, loadingInitial } = get();
        if (loadingInitial) return;

        set({
            loadingInitial: true,
            tenantId,
            cursor: null,
            hasMore: true,
            items: [],
        });

        try {
            const result = await dealService.listDealsByTenantPaged({
                tenantId,
                stage: stageFilter,
                cursor: null,
                pageSize: 10,
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
            stageFilter,
            cursor,
            hasMore,
            loadingMore,
            loadingInitial,
        } = get();

        if (!tenantId) return;
        if (!hasMore || loadingMore || loadingInitial) return;

        set({ loadingMore: true });

        try {
            const result = await dealService.listDealsByTenantPaged({
                tenantId,
                stage: stageFilter,
                cursor,
                pageSize: 10,
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
