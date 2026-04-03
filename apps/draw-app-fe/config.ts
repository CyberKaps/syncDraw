const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : 'localhost';

// HTTP Backend (API)
export const HTTP_BACKEND =
  process.env.NEXT_PUBLIC_HTTP_BACKEND_URL ||
  (isBrowser
    ? `https://${hostname}`      // production
    : "http://localhost:3001");  // local dev

// WebSocket Backend
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_BACKEND_URL ||
  (isBrowser
    ? `wss://${hostname}`        // production WebSocket (secure)
    : "ws://localhost:8080");    // local dev
