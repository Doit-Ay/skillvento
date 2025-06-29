/// <reference types="vite/client" />

// Global type declarations for external libraries
declare global {
  interface Window {
    pdfjsLib: any;
    jspdf: any;
  }
}

export {};