"use client";

import * as React from 'react';
import { getAuth, onIdTokenChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const auth = getAuth(app);
const db = getFirestore(app);

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass:string) => Promise<any>;
    signup: (email: string, pass: string, username: string) => Promise<any>;
    signupStudio: (email: string, pass: string, username: string) => Promise<any>;
    logout: () => Promise<any>;
    userData: any;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const setSessionCookie = (idToken: string | null) => {
    if (idToken) {
        document.cookie = `__session=${idToken};path=/;max-age=3600;samesite=lax`;
    } else {
        document.cookie = '__session=;path=/;max-age=0;samesite=lax';
    }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [userData, setUserData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                setUser(user);
                const idToken = await user.getIdToken();
                setSessionCookie(idToken);
                
                const userDocRef = doc(db, "user_profiles", user.uid);
                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    } else {
                        // This might be a new user, or data is missing.
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
            } else {
                setUser(null);
                setUserData(null);
                setSessionCookie(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    React.useEffect(() => {
        const publicPaths = ['/login', '/signup', '/welcome', '/signup-studio'];
        const isPublicPath = publicPaths.some(p => pathname.startsWith(p));
        
        if (!loading && !user && !isPublicPath) {
            router.push('/welcome');
        }

    }, [user, loading, router, pathname]);


    const login = (email: string, pass: string) => {
        return signInWithEmailAndPassword(auth, email, pass);
    };

    const signup = async (email: string, pass: string, username: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Create user profile document in 'user_profiles' collection
        const userProfileRef = doc(db, "user_profiles", user.uid);
        const userProfileData = {
            userId: user.uid,
            username: username,
            bio: "",
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
            coverUrl: "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            followers: [],
            following: [],
            isVerified: false,
            skills: ["Content Creator", "Videographer"]
        };
        
        await setDoc(userProfileRef, userProfileData).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userProfileRef.path,
                operation: 'create',
                requestResourceData: userProfileData
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError; // Propagate error
        });
        
        return userCredential;
    };
    
    const signupStudio = async (email: string, pass: string, username: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Create user profile document in 'user_profiles' collection
        const userProfileRef = doc(db, "user_profiles", user.uid);
        const userProfileData = {
            userId: user.uid,
            username: username,
            role: "Studio",
            bio: "Studio Owner",
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
            coverUrl: "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            followers: [],
            following: [],
            isVerified: false,
            skills: ["Studio Rental", "Production Services"]
        };
        
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

    const logout = () => {
        return signOut(auth);
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
