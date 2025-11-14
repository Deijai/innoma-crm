// src/services/firebase/contactService.ts
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

export interface ContactDoc {
    id: string;
    tenantId: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    companyName?: string | null;
    ownerUserId?: string | null;
    tags?: string[];
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}

export type ContactStatusFilter = 'all' | 'active' | 'archived';

interface ContactPageResult {
    items: ContactDoc[];
    cursor: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
}

class ContactService {
    private collectionRef = collection(db, 'contacts');

    async createContact(
        data: Omit<ContactDoc, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>,
    ) {
        const payload: Omit<ContactDoc, 'id'> = {
            ...data,
            email: data.email ?? null,
            phone: data.phone ?? null,
            companyName: data.companyName ?? null,
            ownerUserId: data.ownerUserId ?? null,
            tags: data.tags ?? [],
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const ref = await addDoc(this.collectionRef, payload);
        return {
            id: ref.id,
            ...payload,
        } as ContactDoc;
    }

    async getContact(id: string): Promise<ContactDoc | null> {
        const snap = await getDoc(doc(db, 'contacts', id));
        if (!snap.exists()) return null;

        return {
            id: snap.id,
            ...(snap.data() as Omit<ContactDoc, 'id'>),
        };
    }

    async listContactsByTenantPaged(params: {
        tenantId: string;
        status?: ContactStatusFilter;
        cursor?: QueryDocumentSnapshot<DocumentData> | null;
        pageSize?: number;
    }): Promise<ContactPageResult> {
        const { tenantId, status = 'active', cursor, pageSize = 10 } = params;

        const constraints: any[] = [where('tenantId', '==', tenantId)];

        if (status === 'active') {
            constraints.push(where('isActive', '==', true));
        } else if (status === 'archived') {
            constraints.push(where('isActive', '==', false));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        if (cursor) {
            constraints.push(startAfter(cursor));
        }

        constraints.push(fbLimit(pageSize));

        const q = query(this.collectionRef, ...constraints);
        const snap = await getDocs(q);

        const items: ContactDoc[] = [];
        snap.forEach((d) => {
            items.push({
                id: d.id,
                ...(d.data() as Omit<ContactDoc, 'id'>),
            });
        });

        const lastDoc =
            snap.docs.length > 0
                ? snap.docs[snap.docs.length - 1]
                : null;

        return {
            items,
            cursor: lastDoc,
            hasMore: snap.docs.length === pageSize,
        };
    }

    // helper simples caso precise em outros lugares
    async listContactsByTenant(tenantId: string) {
        const { items } = await this.listContactsByTenantPaged({
            tenantId,
            status: 'active',
            pageSize: 50,
        });
        return items;
    }

    async updateContact(
        id: string,
        data: Partial<Omit<ContactDoc, 'id' | 'tenantId' | 'createdAt'>>,
    ) {
        await updateDoc(doc(db, 'contacts', id), {
            ...data,
            updatedAt: Date.now(),
        });
    }

    async softDeleteContact(id: string) {
        await updateDoc(doc(db, 'contacts', id), {
            isActive: false,
            updatedAt: Date.now(),
        });
    }
}

export const contactService = new ContactService();
