'use client';

/**
 * @fileoverview This component listens for custom 'permission-error' events
 * and throws them in a way that Next.js will catch and display in its
 * development error overlay. This is a crucial tool for debugging
 * Firestore security rules.
 */

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Throwing the error here will cause it to be caught by Next.js's
      // development error overlay, providing a rich debugging experience.
      // This is intentional and for development purposes only.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component does not render anything to the DOM.
  return null;
}
