
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

const auth = getAuth(app);
const db = getFirestore(app);

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<any>;
    signup: (email: string, pass: string, username: string) => Promise<any>;
    logout: () => Promise<any>;
    userData: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        const publicPaths = ['/login', '/signup', '/welcome'];
        const isPublicPath = publicPaths.includes(pathname);
        
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
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            username: username,
            bio: "",
            avatarUrl: "",
            coverUrl: "",
            followers: [],
            following: [],
            isVerified: false,
        });
        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
