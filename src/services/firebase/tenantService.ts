// src/services/firebase/tenantService.ts
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface TenantDoc {
    id: string;
    name: string;
    document?: string | null;
    ownerUserId: string;
    isActive: boolean;
    createdAt: number;
}

class TenantService {
    private collectionRef = collection(db, 'tenants');

    async createTenant(
        ownerUserId: string,
        data: { name: string; document?: string },
    ): Promise<string> {
        const payload: Omit<TenantDoc, 'id'> = {
            name: data.name,
            document: data.document ?? null,
            ownerUserId,
            isActive: true,
            createdAt: Date.now(),
        };

        const ref = await addDoc(this.collectionRef, payload);
        return ref.id;
    }

    async getTenant(id: string): Promise<TenantDoc | null> {
        const snap = await getDoc(doc(db, 'tenants', id));
        if (!snap.exists()) return null;

        return {
            id: snap.id,
            ...(snap.data() as Omit<TenantDoc, 'id'>),
        };
    }

    async getTenantByOwner(ownerUserId: string): Promise<TenantDoc | null> {
        const q = query(
            this.collectionRef,
            where('ownerUserId', '==', ownerUserId),
            where('isActive', '==', true),
        );
        const snap = await getDocs(q);
        if (snap.empty) return null;

        const d = snap.docs[0];
        return {
            id: d.id,
            ...(d.data() as Omit<TenantDoc, 'id'>),
        };
    }

    async updateTenant(
        id: string,
        data: Partial<Omit<TenantDoc, 'id' | 'ownerUserId' | 'createdAt'>>,
    ) {
        await updateDoc(doc(db, 'tenants', id), data);
    }
}

export const tenantService = new TenantService();
