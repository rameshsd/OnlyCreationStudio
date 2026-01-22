
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
  DocumentReference,
  getDoc,
} from "firebase/firestore";
import { errorEmitter } from "../error-emitter";
import { FirestorePermissionError } from "../errors";

export interface WithId<T> extends T {
  id: string;
}

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
  mutate: () => void;
}

export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const mutate = useCallback(() => {
    if (!memoizedDocRef) return;
    setIsLoading(true);
    getDoc(memoizedDocRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
      })
      .catch((err) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path
        });
        setError(contextualError);
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [memoizedDocRef]);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null); // Reset data on new ref

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          const docData = { ...(snapshot.data() as T), id: snapshot.id };
          setData(docData);
        } else {
          setData(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path
        })
        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, isLoading, error, mutate };
}
