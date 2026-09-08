// Reusable, generic, and strongly-typed Firestore Service Layer
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  Unsubscribe,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../core/firebase';
import { BaseEntity } from '../types';

export class FirestoreGenericService<T extends BaseEntity> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Get collection reference
  protected getColRef() {
    return collection(db, this.collectionName);
  }

  // Create new document with auto or custom ID
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, customId?: string): Promise<string> {
    const docRef = customId ? doc(db, this.collectionName, customId) : doc(this.getColRef());
    const timestamp = Date.now();
    const payload = {
      ...data,
      id: docRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
      isDeleted: false,
    };
    await setDoc(docRef, payload);
    return docRef.id;
  }

  // Get single document by ID
  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as T;
  }

  // Update existing document
  async update(id: string, updates: Partial<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const payload = {
      ...updates,
      updatedAt: Date.now(),
    };
    await updateDoc(docRef, payload as DocumentData);
  }

  // Soft delete document
  async softDelete(id: string): Promise<void> {
    await this.update(id, { isDeleted: true } as unknown as Partial<T>);
  }

  // Hard delete document
  async hardDelete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // List all active documents
  async listAll(includeDeleted: boolean = false): Promise<T[]> {
    const constraints: QueryConstraint[] = [];
    if (!includeDeleted) {
      constraints.push(where('isDeleted', '==', false));
    }
    const q = query(this.getColRef(), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as T);
  }

  // Query documents with filter
  async queryByField(fieldName: string, operator: any, value: any): Promise<T[]> {
    const q = query(
      this.getColRef(),
      where('isDeleted', '==', false),
      where(fieldName, operator, value)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as T);
  }

  // Real-time listener subscription
  subscribe(
    onData: (items: T[]) => void,
    onError?: (err: Error) => void,
    constraints: QueryConstraint[] = []
  ): Unsubscribe {
    // NOTE: isDeleted filter is applied CLIENT-SIDE to avoid needing composite
    // Firestore indexes on every collection. This lets all collections work
    // immediately without Firebase console index setup.
    const q = constraints.length > 0
      ? query(this.getColRef(), ...constraints)
      : this.getColRef();

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map((docSnap) => docSnap.data() as T)
          .filter((item) => !(item as any).isDeleted);
        onData(items);
      },
      (error) => {
        console.error(`Subscription error on ${this.collectionName}:`, error);
        if (onError) onError(error);
      }
    );
  }

  // Real-time single document subscription
  subscribeDoc(
    id: string,
    onData: (item: T | null) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const docRef = doc(db, this.collectionName, id);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data() as T);
        } else {
          onData(null);
        }
      },
      (error) => {
        console.error(`Doc subscription error on ${this.collectionName}/${id}:`, error);
        if (onError) onError(error);
      }
    );
  }
}
