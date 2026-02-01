// A 'use client' directive is not necessary in this file as it contains no React components.

/**
 * @fileoverview Creates and exports a singleton event emitter.
 * This is used for globally broadcasting events, such as custom
 * Firestore permission errors, without tightly coupling components.
 */

import { EventEmitter } from 'events';

// Create a new class that extends EventEmitter
class MyEventEmitter extends EventEmitter {}

// Export a single instance (singleton)
export const errorEmitter = new MyEventEmitter();
