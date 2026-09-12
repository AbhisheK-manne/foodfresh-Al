import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { DatasetItem, FoodAnalysisResult } from './types';

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Export Firestore with specific database ID (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 3. Export Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 4. Firestore Error Handling conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 5. Test Connection at Startup (Mandatory)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
    } else {
      // Permission denied or not-found on probe doc is normal and indicates reachable backend
      console.log('Firebase backend reachable.');
    }
    return true;
  }
}

// 6. Sign In / Out helpers using popup
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function logOut() {
  await signOut(auth);
}

// 7. Scans Persistent CRUD in Firestore
export function subscribeUserScans(
  userId: string,
  onData: (scans: FoodAnalysisResult[]) => void,
  onError?: (err: unknown) => void
) {
  const scansPath = `users/${userId}/scans`;
  try {
    const scansCol = collection(db, 'users', userId, 'scans');
    const q = query(scansCol, orderBy('timestamp', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: FoodAnalysisResult[] = [];
        snapshot.forEach((docSnap) => {
          results.push(docSnap.data() as FoodAnalysisResult);
        });
        onData(results);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, scansPath);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, scansPath);
  }
}

export async function saveScanToFirestore(userId: string, scan: FoodAnalysisResult): Promise<void> {
  const docPath = `users/${userId}/scans/${scan.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'scans', scan.id);
    const payload = {
      ...scan,
      userId,
    };
    await setDoc(docRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function deleteScanFromFirestore(userId: string, scanId: string): Promise<void> {
  const docPath = `users/${userId}/scans/${scanId}`;
  try {
    const docRef = doc(db, 'users', userId, 'scans', scanId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

export async function clearAllUserScans(userId: string): Promise<void> {
  const colPath = `users/${userId}/scans`;
  try {
    const scansCol = collection(db, 'users', userId, 'scans');
    const snapshot = await getDocs(scansCol);
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, colPath);
  }
}

// 8. Dataset Items Persistent CRUD in Firestore
export function subscribeDataset(
  onData: (items: DatasetItem[]) => void,
  onError?: (err: unknown) => void
) {
  const datasetPath = 'dataset';
  try {
    const colRef = collection(db, 'dataset');
    const q = query(colRef, orderBy('created_at', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: DatasetItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as DatasetItem);
        });
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, datasetPath);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, datasetPath);
  }
}

export async function addDatasetItemToFirestore(userId: string, item: Omit<DatasetItem, 'id' | 'created_at'>): Promise<DatasetItem> {
  const id = `ds_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const docPath = `dataset/${id}`;
  const fullItem: DatasetItem = {
    ...item,
    id,
    authorId: userId,
    created_at: new Date().toISOString(),
  };
  try {
    const docRef = doc(db, 'dataset', id);
    await setDoc(docRef, fullItem);
    return fullItem;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, docPath);
  }
}

export async function deleteDatasetItemFromFirestore(itemId: string): Promise<void> {
  const docPath = `dataset/${itemId}`;
  try {
    const docRef = doc(db, 'dataset', itemId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}
