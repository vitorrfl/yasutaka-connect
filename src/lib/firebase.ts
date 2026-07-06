import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const alreadyInitialized = getApps().length > 0;

export const firebaseApp = alreadyInitialized ? getApp() : initializeApp(firebaseConfig);

// Todo o acesso a dados roda server-side (Server Components / Server Actions em
// Node). O transporte padrão do Firestore (WebChannel) costuma falhar nesse
// ambiente e em redes restritas, resultando em "Backend didn't respond within
// 10 seconds". Forçar long polling usa HTTP simples e conecta de forma confiável.
export const db = alreadyInitialized
  ? getFirestore(firebaseApp)
  : initializeFirestore(firebaseApp, { experimentalForceLongPolling: true });
