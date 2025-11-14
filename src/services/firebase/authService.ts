// src/services/firebase/authService.ts
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

class AuthService {
    listenAuthChanges(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
    }

    async registerWithEmail(email: string, password: string) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        return cred.user;
    }

    async login(email: string, password: string) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
    }

    async logout() {
        await signOut(auth);
    }

    async registerUserWithEmail(email: string, password: string) {
        return this.registerWithEmail(email, password);
    }
}

export const authService = new AuthService();
