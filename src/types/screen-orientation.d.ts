// Add TypeScript declaration to allow using screen.orientation.lock in browsers that implement it
declare global {
  interface ScreenOrientation {
    lock?(orientation?: string): Promise<void>;
    unlock?(): void;
  }
}

export {};