import { useState, useEffect } from 'react';
import { FirestoreGenericService } from '../services/firestoreGeneric.service';
import { BaseEntity } from '../types';
import { QueryConstraint } from 'firebase/firestore';

export function useFirestoreCollection<T extends BaseEntity>(
  service: FirestoreGenericService<T>,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = service.subscribe(
      (items) => {
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      constraints
    );

    return () => unsubscribe();
  }, [service]);

  return { data, loading, error };
}

export function useFirestoreDoc<T extends BaseEntity>(
  service: FirestoreGenericService<T>,
  docId: string | undefined
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = service.subscribeDoc(
      docId,
      (item) => {
        setData(item);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [service, docId]);

  return { data, loading, error };
}
