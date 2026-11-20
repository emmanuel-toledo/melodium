export { auth } from '@/shared/lib/firebase/auth';
export { db } from '@/shared/lib/firebase/firestore';
export {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
export type { User as FirebaseUser } from 'firebase/auth';
export {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
export type { DocumentData, FirestoreError, QueryDocumentSnapshot } from 'firebase/firestore';

export type Unsubscribe = () => void;
