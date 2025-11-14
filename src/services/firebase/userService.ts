// src/services/firebase/userService.ts
import {
    collection,
    doc,
    DocumentData,
    limit as fbLimit,
    getDoc,
    getDocs,
    orderBy,
    query,
    QueryDocumentSnapshot,
    setDoc,
    startAfter,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export type UserRole = 'MASTER' | 'USER';

export interface UserDoc {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    tenantId?: string | null;
    isActive: boolean;
    createdAt: number;
}

interface UserPageResult {
    items: UserDoc[];
    cursor: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
}

class UserService {
    async createUser(uid: string, data: Omit<UserDoc, 'id' | 'createdAt'>) {
        const payload: UserDoc = {
            id: uid,
            ...data,
            createdAt: Date.now(),
        };
        await setDoc(doc(db, 'users', uid), payload);
        return payload;
    }

    async getUser(uid: string): Promise<UserDoc | null> {
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) return null;
        return snap.data() as UserDoc;
    }

    async updateUser(uid: string, data: Partial<UserDoc>) {
        await updateDoc(doc(db, 'users', uid), data);
    }

    async listUsersByTenantPaged(params: {
        tenantId: string;
        cursor?: QueryDocumentSnapshot<DocumentData> | null;
        pageSize?: number;
        onlyActive?: boolean;
    }): Promise<UserPageResult> {
        const { tenantId, cursor, pageSize = 10, onlyActive = false } = params;

        const constraints: any[] = [where('tenantId', '==', tenantId)];

        if (onlyActive) {
            constraints.push(where('isActive', '==', true));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        if (cursor) {
            constraints.push(startAfter(cursor));
        }

        constraints.push(fbLimit(pageSize));

        const q = query(collection(db, 'users'), ...constraints);
        const snap = await getDocs(q);

        const items: UserDoc[] = [];
        snap.forEach((d) => {
            items.push(d.data() as UserDoc);
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

    async listUsersByTenant(tenantId: string) {
        const { items } = await this.listUsersByTenantPaged({
            tenantId,
            pageSize: 50,
        });
        return items;
    }
}

export const userService = new UserService();
