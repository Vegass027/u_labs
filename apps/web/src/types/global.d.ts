// Global type declarations for browser APIs
declare global {
  interface Window {
    alert(message: string): void
    confirm(message: string): boolean
  }

  function alert(message: string): void
  function confirm(message: string): boolean
}

export {}
