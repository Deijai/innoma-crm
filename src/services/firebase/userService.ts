// src/services/firebase/userService.ts
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where
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

    async listUsersByTenant(tenantId: string) {
        const q = query(
            collection(db, 'users'),
            where('tenantId', '==', tenantId),
        );

        const snap = await getDocs(q);
        const items: UserDoc[] = [];

        snap.forEach((d) => {
            items.push(d.data() as UserDoc);
        });

        return items;
    }
}

export const userService = new UserService();
