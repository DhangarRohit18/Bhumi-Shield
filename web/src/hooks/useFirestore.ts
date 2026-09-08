import { useState, useEffect } from 'react';
import { FirestoreGenericService } from '../services/firestoreGeneric.service';
import { BaseEntity } from '../types';
import { QueryConstraint } from 'firebase/firestore';
import {
  FALLBACK_STATES,
  FALLBACK_DISTRICTS,
  FALLBACK_PROJECTS,
  FALLBACK_VILLAGES,
  FALLBACK_PARCELS,
  FALLBACK_FARMERS,
  FALLBACK_BOTTLENECKS,
  FALLBACK_OFFICER_WORKLOADS,
  FALLBACK_INTERVENTIONS,
  FALLBACK_WORKFLOW_EVENTS,
  FALLBACK_COMPENSATION,
  FALLBACK_DOCUMENTS,
  FALLBACK_LEGAL_CASES,
  FALLBACK_PREDICTIONS,
  FALLBACK_STRUCTURAL_ASSETS
} from '../utils/staticFallbackData';

const FALLBACK_MAP: Record<string, any[]> = {
  'states': FALLBACK_STATES,
  'districts': FALLBACK_DISTRICTS,
  'projects': FALLBACK_PROJECTS,
  'villages': FALLBACK_VILLAGES,
  'parcels': FALLBACK_PARCELS,
  'farmers': FALLBACK_FARMERS,
  'bottlenecks': FALLBACK_BOTTLENECKS,
  'officer_workloads': FALLBACK_OFFICER_WORKLOADS,
  'interventions': FALLBACK_INTERVENTIONS,
  'workflow_events': FALLBACK_WORKFLOW_EVENTS,
  'compensation': FALLBACK_COMPENSATION,
  'documents': FALLBACK_DOCUMENTS,
  'legal_cases': FALLBACK_LEGAL_CASES,
  'predictions': FALLBACK_PREDICTIONS,
  'structural_assets': FALLBACK_STRUCTURAL_ASSETS
};

export function useFirestoreCollection<T extends BaseEntity>(
  service: FirestoreGenericService<T>,
  constraints: QueryConstraint[] = []
) {
  const collectionName = (service as any).collectionName || '';
  const fallbackList = (FALLBACK_MAP[collectionName] as T[]) || [];

  const [data, setData] = useState<T[]>(fallbackList);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = service.subscribe(
      (items) => {
        if (items && items.length > 0) {
          setData(items);
        } else {
          setData(fallbackList);
        }
        setLoading(false);
      },
      (err) => {
        console.warn(`[Firestore Hook Warning] ${collectionName} subscription failed. Using fallback dataset.`, err);
        setError(err);
        setData(fallbackList);
        setLoading(false);
      },
      constraints
    );

    return () => unsubscribe();
  }, [service, collectionName]);

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
