import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { auth, db } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { User, AuthState } from '@/types';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid);
      
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });

          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            isOnline: true,
            lastSeen: serverTimestamp(),
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, privateId: string) => {
    try {
      const existingPrivateId = await getDoc(doc(db, 'privateIds', privateId));
      if (existingPrivateId.exists()) {
        throw new Error('Private ID already taken');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      const user: User = {
        id: firebaseUser.uid,
        privateId,
        name,
        email,
        isOnline: true,
        isPublic: false,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...user,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      });

      await setDoc(doc(db, 'privateIds', privateId), {
        userId: firebaseUser.uid,
      });

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });

        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        });

        return userData;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (authState.user) {
        await updateDoc(doc(db, 'users', authState.user.id), {
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
      }

      await firebaseSignOut(auth);

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!authState.user) return;
    
    try {
      await updateDoc(doc(db, 'users', authState.user.id), updates);
      
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user!, ...updates },
      }));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const searchUserByPrivateId = async (privateId: string): Promise<User | null> => {
    try {
      const privateIdDoc = await getDoc(doc(db, 'privateIds', privateId));
      
      if (privateIdDoc.exists()) {
        const userId = privateIdDoc.data().userId;
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          return userDoc.data() as User;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Search user error:', error);
      return null;
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateUser,
    searchUserByPrivateId,
  };
});
