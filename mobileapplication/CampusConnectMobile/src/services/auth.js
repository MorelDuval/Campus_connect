import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const loginUser = async (email, password, role) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists() || userDoc.data().role !== role) {
    await signOut(auth);
    throw new Error(`This account is not a ${role}`);
  }
  return { uid: user.uid, ...userDoc.data() };
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  return userDoc.exists() ? { uid: user.uid, ...userDoc.data() } : null;
};