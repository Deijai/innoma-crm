// src/services/firebase/tenantService.ts
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { userService } from './userService';

export interface TenantDoc {
    id?: string;
    name: string;
    document?: string;
    ownerUserId: string;
    isActive: boolean;
    createdAt: number;
}

class TenantService {
    async createTenant(ownerUid: string, data: { name: string; document?: string }) {
        const payload: Omit<TenantDoc, 'id'> = {
            name: data.name,
            document: data.document,
            ownerUserId: ownerUid,
            isActive: true,
            createdAt: Date.now(),
        };

        const ref = await addDoc(collection(db, 'tenants'), payload);

        // Vincular tenantId ao MASTER
        await userService.updateUser(ownerUid, {
            tenantId: ref.id,
        });

        return ref.id;
    }
}

export const tenantService = new TenantService();
