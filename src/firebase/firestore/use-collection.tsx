
"use client";

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * A SAFE and STABLE Firestore real-time hook.
 */
export function useCollection<T = any>(
  memoizedQuery: Query<DocumentData> | CollectionReference<DocumentData> | null
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedQuery) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs: WithId<T>[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));

        setData(docs);
        setIsLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        // Create and emit a contextual error for better debugging.
        const contextualError = new FirestorePermissionError({
          path: (memoizedQuery as CollectionReference).path, // Assumes it's a collection ref for path
          operation: 'list',
        });
        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, isLoading, error };
}
