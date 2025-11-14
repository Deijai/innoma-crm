// src/services/firebase/userInviteService.ts
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface UserInviteDoc {
    id?: string;
    email: string;
    name: string;
    role: 'USER';
    tenantId: string;
    activationCode: string;
    isUsed: boolean;
    createdAt: number;
    usedAt?: number;
}

class UserInviteService {
    private collectionRef = collection(db, 'userInvites');

    async createInvite(data: Omit<UserInviteDoc, 'id' | 'createdAt' | 'isUsed'>) {
        const payload: Omit<UserInviteDoc, 'id'> = {
            ...data,
            isUsed: false,
            createdAt: Date.now(),
        };

        const ref = await addDoc(this.collectionRef, payload);
        return {
            id: ref.id,
            ...payload,
        } as UserInviteDoc;
    }

    async listInvitesByTenant(tenantId: string) {
        const q = query(this.collectionRef, where('tenantId', '==', tenantId));
        const snap = await getDocs(q);
        const items: UserInviteDoc[] = [];
        snap.forEach((d) => {
            items.push({
                id: d.id,
                ...(d.data() as Omit<UserInviteDoc, 'id'>),
            });
        });
        return items;
    }

    async findValidInvite(email: string, activationCode: string) {
        const q = query(
            this.collectionRef,
            where('email', '==', email),
            where('activationCode', '==', activationCode),
            where('isUsed', '==', false),
        );
        const snap = await getDocs(q);
        if (snap.empty) return null;

        const d = snap.docs[0];
        return {
            id: d.id,
            ...(d.data() as Omit<UserInviteDoc, 'id'>),
        } as UserInviteDoc;
    }

    async markInviteAsUsed(inviteId: string) {
        await updateDoc(doc(db, 'userInvites', inviteId), {
            isUsed: true,
            usedAt: Date.now(),
        });
    }
}

export const userInviteService = new UserInviteService();
