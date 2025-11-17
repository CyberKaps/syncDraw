


// Use window.location to dynamically determine the backend URL
// This allows the same build to work in dev and production
const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : 'localhost';

export const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND_URL || 
  (isBrowser ? `http://${hostname}:3001` : "http://localhost:3001");
export const WS_URL = process.env.NEXT_PUBLIC_WS_BACKEND_URL || 
  (isBrowser ? `ws://${hostname}:8080` : "ws://localhost:8080");