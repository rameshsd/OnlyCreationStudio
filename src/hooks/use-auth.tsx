

"use client";

import * as React from 'react';
import { getAuth, onIdTokenChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const auth = getAuth(app);
const db = getFirestore(app);

interface UserData {
    id: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    followers?: string[];
    following?: string[];
    isVerified?: boolean;
    skills?: string[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass:string) => Promise<any>;
    signup: (email: string, pass: string, username: string) => Promise<any>;
    signupStudio: (email: string, pass: string, username: string) => Promise<any>;
    logout: () => Promise<any>;
    userData: UserData | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const setSessionCookie = async (idToken: string | null) => {
    try {
        await fetch('/api/auth/session', {
            method: idToken ? 'POST' : 'DELETE',
            headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {},
        });
    } catch (error) {
        console.error("Failed to set session cookie:", error);
    }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [userData, setUserData] = React.useState<UserData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();

    const fetchUserData = React.useCallback(async (currentUser: User | null) => {
        if (!currentUser) {
            setUserData(null);
            return;
        }
        const userDocRef = doc(db, "user_profiles", currentUser.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserData({ id: userDoc.id, ...userDoc.data() } as UserData);
            } else {
                setUserData(null);
            }
        } catch (serverError) {
             const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            setUserData(null);
        }
    }, []);

    React.useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                setUser(user);
                const idToken = await user.getIdToken();
                await setSessionCookie(idToken);
                await fetchUserData(user);
            } else {
                setUser(null);
                setUserData(null);
                await setSessionCookie(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [fetchUserData]);

    const login = (email: string, pass: string) => {
        return signInWithEmailAndPassword(auth, email, pass);
    };

    const signup = async (email: string, pass: string, username: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        const userProfileRef = doc(db, "user_profiles", user.uid);
        const userProfileData: Omit<UserData, 'id'> = {
            username: username,
            bio: "New to OnlyCreation!",
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
            coverUrl: "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            followers: [],
            following: [],
            isVerified: false,
            skills: ["Content Creator"]
        };
        
        setUserData({ id: user.uid, ...userProfileData });
        await setDoc(userProfileRef, userProfileData).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userProfileRef.path,
                operation: 'create',
                requestResourceData: userProfileData
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
        
        return userCredential;
    };
    
    const signupStudio = async (email: string, pass: string, username: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        const userProfileRef = doc(db, "user_profiles", user.uid);
        const userProfileData: Omit<UserData, 'id'> = {
            username: username,
            bio: "Studio Owner",
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
            coverUrl: "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            followers: [],
            following: [],
            isVerified: false,
            skills: ["Studio Rental", "Production Services"]
        };
        
        setUserData({ id: user.uid, ...userProfileData });
        await setDoc(userProfileRef, userProfileData).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userProfileRef.path,
                operation: 'create',
                requestResourceData: userProfileData
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
        
        return userCredential;
    };

    const logout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, login, signup, signupStudio, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
