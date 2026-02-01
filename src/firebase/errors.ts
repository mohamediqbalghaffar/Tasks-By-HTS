// A 'use client' directive is not necessary in this file as it contains no React components.

/**
 * @fileoverview Defines custom error types for Firebase interactions,
 * particularly for surfacing detailed Firestore security rule permission errors.
 */

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any; // The data being sent in a create/update request
};

/**
 * A custom error class to encapsulate detailed information about a
 * Firestore security rule denial. This helps in debugging by providing
 * context that is otherwise unavailable in standard Firebase errors.
 */
export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    // Construct a detailed error message
    const message = `FirestoreError: Missing or insufficient permissions. The following request was denied by Firestore Security Rules:
{
  "operation": "${context.operation}",
  "path": "${context.path}"${context.requestResourceData ? `,\n  "requestData": ${JSON.stringify(context.requestResourceData, null, 2)}` : ''}
}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is to make the error visible in the Next.js error overlay
    // by making the stack trace more readable and pointing to this file.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
