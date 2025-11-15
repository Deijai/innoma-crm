// src/services/firebase/dealService.ts
import {
    addDoc,
    collection,
    doc,
    DocumentData,
    limit as fbLimit,
    getDoc,
    getDocs,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export type DealStage =
    | 'new'
    | 'qualified'
    | 'proposal'
    | 'negotiation'
    | 'won'
    | 'lost';

export type DealStatus = 'open' | 'won' | 'lost';

export interface DealDoc {
    id: string;
    tenantId: string;
    title: string;
    amount: number;
    currency: string;
    stage: DealStage;
    status: DealStatus;
    contactId?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    ownerUserId?: string | null;
    expectedCloseDate?: number | null;
    createdAt: number;
    updatedAt: number;
}


interface DealPageResult {
    items: DealDoc[];
    cursor: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
}

class DealService {
    private collectionRef = collection(db, 'deals');

    async createDeal(
        data: Omit<
            DealDoc,
            'id' | 'createdAt' | 'updatedAt' | 'status' | 'currency'
        > & { currency?: string },
    ) {
        const payload: Omit<DealDoc, 'id'> = {
            ...data,
            amount: data.amount ?? 0,
            contactId: data.contactId ?? null,
            contactName: data.contactName ?? null,
            contactEmail: data.contactEmail ?? null,
            ownerUserId: data.ownerUserId ?? null,
            expectedCloseDate: data.expectedCloseDate ?? null,
            status:
                data.stage === 'won'
                    ? 'won'
                    : data.stage === 'lost'
                        ? 'lost'
                        : 'open',
            currency: data.currency ?? 'BRL',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const ref = await addDoc(this.collectionRef, payload);
        return {
            id: ref.id,
            ...payload,
        } as DealDoc;
    }

    async getDeal(id: string): Promise<DealDoc | null> {
        const snap = await getDoc(doc(db, 'deals', id));
        if (!snap.exists()) return null;

        return {
            id: snap.id,
            ...(snap.data() as Omit<DealDoc, 'id'>),
        };
    }

    async listDealsByTenantPaged(params: {
        tenantId: string;
        stage?: DealStage | 'all';
        cursor?: QueryDocumentSnapshot<DocumentData> | null;
        pageSize?: number;
    }): Promise<DealPageResult> {
        const { tenantId, stage = 'all', cursor, pageSize = 10 } = params;

        const constraints: any[] = [where('tenantId', '==', tenantId)];

        if (stage !== 'all') {
            constraints.push(where('stage', '==', stage));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        if (cursor) {
            constraints.push(startAfter(cursor));
        }

        constraints.push(fbLimit(pageSize));

        const q = query(this.collectionRef, ...constraints);
        const snap = await getDocs(q);

        const items: DealDoc[] = [];
        snap.forEach((d) => {
            items.push({
                id: d.id,
                ...(d.data() as Omit<DealDoc, 'id'>),
            });
        });

        const lastDoc =
            snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

        return {
            items,
            cursor: lastDoc,
            hasMore: snap.docs.length === pageSize,
        };
    }

    async updateDeal(
        id: string,
        data: Partial<
            Omit<DealDoc, 'id' | 'tenantId' | 'createdAt'>
        >,
    ) {
        const patch: any = {
            ...data,
            updatedAt: Date.now(),
        };

        if (data.stage) {
            patch.status =
                data.stage === 'won'
                    ? 'won'
                    : data.stage === 'lost'
                        ? 'lost'
                        : 'open';
        }

        await updateDoc(doc(db, 'deals', id), patch);
    }


    async softDeleteDeal(id: string) {
        await updateDoc(doc(db, 'deals', id), {
            status: 'lost',
            stage: 'lost',
            updatedAt: Date.now(),
        });
    }
}

export const dealService = new DealService();
