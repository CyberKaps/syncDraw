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

### 🧰 Canvas Tools

- ✅ Rectangle tool
- ⏳ Upcoming: Free draw, Eraser, Line, Circle, Diamond

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
├── apps/                          # All individual apps live here
│   ├── draw-app-fe/               # Frontend drawing app (Next.js)
│   │   ├── app/                   # App routing (canvas, auth pages)
│   │   ├── components/            # Reusable UI components (canvas, auth)
│   │   ├── public/                # Static assets
│   │   ├── config.ts              # Shared configs
│   │   └── ...                    # Package & tool configs
│   ├── http-backend/             # REST API backend (Express)
│   │   └── src/                   # Server entrypoint & middleware
│   ├── ws-backend/               # WebSocket server for real-time updates
│   │   └── src/                   # WebSocket entrypoint
│   └── web/                       # (Optional) Static landing page or chat frontend
│       ├── components/           # Chat-related UI
│       ├── hooks/                # Socket connection hooks
│       └── app/room/[slug]/      # Dynamic room page
│
├── packages/                      # Shared packages (used by multiple apps)
│   ├── common/                    # Shared TypeScript types and utils
│   ├── db/                        # Prisma schema, DB config, migration
│   ├── backend-common/           # Common backend logic
│   └── ui/                        # Reusable UI components (Button, Card, etc.)
│
├── .vscode/                       # Editor settings
├── .gitignore                     # Git ignored files
├── turbo.json                     # Turborepo config
├── pnpm-workspace.yaml            # Workspace config
├── package.json                   # Root dependencies
└── README.md                      # Project documentation

