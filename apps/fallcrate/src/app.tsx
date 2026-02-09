import { Navbar } from '@fallcrate/components/navbar';
import { Dashboard } from '@fallcrate/components/dashboard/dashboard';
import { UploadQueuePane } from '@fallcrate/components/upload-queue/upload-queue-pane';
import { auth } from '@repo/utils/firebase';
import { useEffect, useState } from 'react';

function App() {
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);

  useEffect(() => {
    // Check if Firebase is available
    if (!auth) {
      console.error('Firebase is not available. Check your environment variables.');
      setFirebaseAvailable(false);
    }
  }, []);

  if (!firebaseAvailable) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-white'>
        <div className='max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center'>
          <h2 className='mb-2 text-xl font-semibold text-red-800'>⚠️ Firebase Not Available</h2>
          <p className='mb-4 text-sm text-red-600'>
            Fallcrate requires Firebase to function. Please ensure all Firebase environment variables are properly configured.
          </p>
          <p className='text-xs text-red-500'>
            Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='flex h-full w-full flex-col bg-white'>
        <Navbar />
        <Dashboard />
      </div>
      <UploadQueuePane />
    </>
  );
}

export { App };
