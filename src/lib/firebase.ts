
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// =================================================================================================
// IMPORTANT: USER ACTION REQUIRED FOR FIREBASE AUTHENTICATION & FIRESTORE
// =================================================================================================
// The application might be unable to connect to Firebase because the API keys are
// missing or invalid. This is why you might see errors like "auth/api-key-not-valid" or connection timeouts.
//
// TO FIX THIS, YOU MUST:
//
// 1. Go to your Firebase project console: https://console.firebase.google.com/
// 2. Select your project (or create a new one if you haven't).
// 3. In your project settings (click the gear icon next to "Project Overview"):
//    a. Go to the "General" tab.
//    b. Under "Your apps", find your web app (or add a new web app if you don't have one).
//    c. In the "Firebase SDK snippet" section, select "Config".
// 4. Copy the `firebaseConfig` object values (apiKey, authDomain, projectId, etc.).
// 5. Create a file named `.env.local` in the ROOT DIRECTORY of this project (if it doesn't already exist).
// 6. Add your Firebase config values to `.env.local` like this:
//
//    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com"
//    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID_HERE"
//    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT_ID.appspot.com"
//    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID_HERE"
//    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID_HERE"
//    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID_HERE" (optional)
//
// 7. Replace "YOUR_..." placeholders with your actual Firebase project values.
// 8. IMPORTANT: Restart your Next.js development server (e.g., by stopping `npm run dev` and running it again)
//    for the changes in `.env.local` to take effect.
// 9. ENABLE AUTHENTICATION: In the Firebase console, go to Authentication -> Sign-in method, and enable "Email/Password".
// 10. ENABLE FIRESTORE: In the Firebase console, go to Firestore Database -> Create database. Start in "test mode" for development,
//     but ensure you set up proper security rules before production.
// 11. ENABLE STORAGE (if using attachments): In the Firebase console, go to Storage -> Get started.
// 12. CHECK FIRESTORE SECURITY RULES: Ensure your rules allow authenticated users to read/write their own data.
//     Example:
//     rules_version = '2';
//     service cloud.firestore {
//       match /databases/{database}/documents {
//         match /users/{userId}/{collection}/{docId} {
//           allow read, write, delete, list: if request.auth != null && request.auth.uid == userId;
//         }
//         match /users/{userId} {
//           allow read, write: if request.auth != null && request.auth.uid == userId;
//         }
//       }
//     }
// =================================================================================================

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

const requiredConfigs: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
const missingConfigs = requiredConfigs.filter(key => !firebaseConfig[key]);

if (missingConfigs.length > 0) {
    console.error(
        '\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n' +
        `CRITICAL FIREBASE CONFIG ERROR: Firebase configuration is incomplete. Missing required environment variables in .env.local for: ${missingConfigs.join(', ')}.\n` +
        'Your app WILL NOT connect to Firebase services (Authentication, Firestore, Storage).\n' +
        '1. Ensure your .env.local file in the project root is correctly set up with ALL necessary Firebase project credentials.\n' +
        '2. Follow the instructions at the top of src/lib/firebase.ts to set up your API keys.\n' +
        '3. After updating .env.local, YOU MUST RESTART YOUR DEVELOPMENT SERVER.\n' +
        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n'
    );
} else {
    if (!getApps().length) {
        try {
            console.log("Attempting to initialize Firebase app with Project ID:", firebaseConfig.projectId);
            app = initializeApp(firebaseConfig);
            console.log("Firebase App initialized successfully for Project ID:", firebaseConfig.projectId);
        } catch (error) {
            console.error("CRITICAL FIREBASE INIT ERROR: Error initializing Firebase app. Check your .env.local Firebase config values. Error details:", error);
            app = undefined;
        }
    } else {
        app = getApp();
        console.log("Firebase App instance retrieved for Project ID:", firebaseConfig.projectId || "N/A (config issue?)");
    }

    if (app) {
        try {
            authInstance = getAuth(app);
            console.log("Firebase Authentication initialized successfully.");
        } catch (error: any) {
            console.error("CRITICAL FIREBASE AUTH INIT ERROR: Error initializing Firebase Authentication. Is Authentication enabled in your Firebase project and .env.local correct? Error details:", error);
            if (error.code === 'auth/invalid-api-key' || error.message?.includes('api-key-not-valid')) {
                console.error("Firebase Auth Error specifically indicates an invalid API Key. Please double check NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file.");
            }
            authInstance = null;
        }
        try {
            dbInstance = getFirestore(app);
            console.log("Firestore initialized successfully for project:", firebaseConfig.projectId);

            // Enable offline persistence
            import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
                if (dbInstance) {
                    enableIndexedDbPersistence(dbInstance, {
                        forceOwnership: false  // Allow multiple tabs
                    }).then(() => {
                        console.log("✅ Firebase offline persistence enabled successfully!");
                    }).catch((err) => {
                        if (err.code === 'failed-precondition') {
                            console.warn("⚠️ Offline persistence failed: Multiple tabs open. Only one tab can enable persistence.");
                        } else if (err.code === 'unimplemented') {
                            console.warn("⚠️ Offline persistence not available in this browser.");
                        } else {
                            console.error("❌ Error enabling offline persistence:", err);
                        }
                    });
                }
            });
        } catch (error) {
            console.error("CRITICAL FIRESTORE INIT ERROR: Error initializing Firestore. Is Firestore ENABLED in your Firebase project (for project ID:", firebaseConfig.projectId, ") and a region selected? Also, check your security rules. Error details:", error);
            dbInstance = null;
        }
        // Initialize Storage - it's okay if it's not used but config is present
        if (firebaseConfig.storageBucket) {
            try {
                storageInstance = getStorage(app);
                console.log("Firebase Storage initialized successfully for bucket:", firebaseConfig.storageBucket);
            } catch (error) {
                console.warn("Firebase Storage WARN: Error initializing Firebase Storage. If you intend to use attachments, ensure Storage is enabled in your Firebase project and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.local is correct. Error details:", error);
                storageInstance = null;
            }
        } else {
            console.warn("Firebase Storage WARN: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not defined in .env.local. File attachment features will not work.");
        }
    }
}

if (!app) {
    console.error("CRITICAL ERROR: Firebase app could not be initialized. Firebase-dependent features will not work. PLEASE ENSURE YOUR .env.local FILE IS CORRECTLY SET UP WITH VALID FIREBASE CREDENTIALS AND RESTART YOUR SERVER.");
}
if (!authInstance) {
    console.error("CRITICAL ERROR: Firebase Authentication could not be initialized. Auth features (login, signup) will NOT work. Please check your Firebase project settings and .env.local file.");
}
if (!dbInstance) {
    // This warning is already quite prominent due to the try/catch above, but we repeat it for critical emphasis.
    console.error("CRITICAL ERROR: Firestore could not be initialized. Database features (saving/loading tasks, notes, chats) will NOT work. Ensure Firestore is enabled in your Firebase project (Project ID:", firebaseConfig.projectId || "UNKNOWN - CHECK .env.local", "), you have selected a region, and your .env.local configuration for `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is correct and matches the project where Firestore is enabled. Also, critically, VERIFY FIRESTORE SECURITY RULES allow access for authenticated users.");
}


export { app, authInstance as auth, dbInstance as db, storageInstance as storage };
