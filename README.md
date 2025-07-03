# 🎨 syncDraw – Real-Time Collaborative Drawing App

syncDraw is a real-time collaborative whiteboard application that enables multiple users to draw together in shared rooms. It supports user authentication, dynamic canvas sessions, and live updates via WebSockets — all built on a scalable monorepo architecture.

---

## 🚀 Features

- 🖌️ Real-time collaborative canvas (room-based)
- 🔐 User authentication (Sign in / Sign up)
- 📡 WebSocket-based live drawing sync
- 💬 (WIP) In-room chat functionality
- 🧱 Monorepo setup using TurboRepo + PNPM
- ♻️ Reusable UI and backend packages
- 🧠 Prisma ORM for DB management

---

## 🧰 Tech Stack

| Layer         | Tech                             |
|--------------|----------------------------------|
| Frontend      | React, Next.js, Tailwind CSS     |
| Backend       | Node.js, Express (HTTP), WebSocket |
| Auth          | Custom auth (email/password)     |
| Database      | PostgreSQL (via Prisma ORM)      |
| Real-time     | WebSocket API                    |
| Dev Tools     | TypeScript, PNPM, TurboRepo      |

---

## 🗂️ Monorepo Structure

syncDraw/
├── apps/
│ ├── draw-app-fe/ # Frontend drawing app
│ ├── http-backend/ # REST API backend
│ └── ws-backend/ # WebSocket server
├── packages/
│ ├── common/ # Shared types/utilities
│ ├── db/ # Prisma + database logic
│ └── ui/ # Reusable UI components
├── turbo.json # Turborepo config
└── pnpm-workspace.yaml # Workspace config


