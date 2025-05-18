import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  adminApp = getApps()[0];
}

export { adminApp, getAuth };
