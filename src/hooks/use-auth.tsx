
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
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
    login: (email: string, pass: string) => Promise<any>;
    signup: (email: string, pass: string, username: string) => Promise<any>;
    signupStudio: (email: string, pass: string, username: string) => Promise<any>;
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
                const userDocRef = doc(db, "user_profiles", user.uid);
                getDoc(userDocRef).then(userDoc => {
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    } else {
                        // if user_profile doesn't exist, try to get from users collection for backward compatibility
                         const oldUserDocRef = doc(db, "users", user.uid);
                         getDoc(oldUserDocRef).then(oldUserDoc => {
                            if (oldUserDoc.exists()) {
                                setUserData(oldUserDoc.data())
                            }
                         }).catch(serverError => {
                            const permissionError = new FirestorePermissionError({
                                path: oldUserDocRef.path,
                                operation: 'get',
                            });
                            errorEmitter.emit('permission-error', permissionError);
                         })
                    }
                }).catch(serverError => {
                    const permissionError = new FirestorePermissionError({
                        path: userDocRef.path,
                        operation: 'get',
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
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
        
        // Create document in 'users' collection
        const userRef = doc(db, "users", user.uid);
        const newUserData = {
            id: user.uid,
            email: user.email,
            createdDateTime: new Date().toISOString(),
        };
         setDoc(userRef, newUserData).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: newUserData
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        // Create document in 'user_profiles' collection
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
        
        setDoc(userProfileRef, userProfileData).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userProfileRef.path,
                operation: 'create',
                requestResourceData: userProfileData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        
        return userCredential;
    };
    
    const signupStudio = async (email: string, pass: string, username: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;
        
        // Create document in 'users' collection
        const userRef = doc(db, "users", user.uid);
        const newUserData = {
            id: user.uid,
            email: user.email,
            createdDateTime: new Date().toISOString(),
        };
         setDoc(userRef, newUserData).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: newUserData
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        // Create document in 'user_profiles' collection
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
        
        setDoc(userProfileRef, userProfileData).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userProfileRef.path,
                operation: 'create',
                requestResourceData: userProfileData
            });
            errorEmitter.emit('permission-error', permissionError);
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
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
