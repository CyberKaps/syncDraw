# 🎨 syncDraw – Real-Time Collaborative Drawing App

syncDraw is a feature-rich real-time collaborative whiteboard application that enables multiple users to draw together in shared rooms. Built with modern web technologies, it provides seamless real-time synchronization, comprehensive drawing tools, secure authentication, and room management — all within a scalable monorepo architecture.

---

## ✨ Key Features

### 🎨 Drawing & Collaboration
- **Real-time Collaborative Canvas** - Multiple users can draw simultaneously with instant synchronization
- **Rich Drawing Tools** - 8 professional drawing tools including:
  - ✏️ **Pencil** - Freehand drawing
  - ⭕ **Circle** - Perfect circles with adjustable radius
  - ▭ **Rectangle** - Rectangular shapes
  - ↗️ **Line** - Straight lines
  - ➡️ **Arrow** - Directional arrows
  - ◇ **Diamond** - Diamond shapes
  - 🔤 **Text** - Add text annotations
  - 🖱️ **Select** - Move and resize shapes with drag handles
  - 🧹 **Eraser** - Remove shapes with click or drag
- **Shape Manipulation** - Drag to move, resize handles for precise adjustments
- **Live Updates** - See other users' drawings in real-time via WebSocket

### 🔐 Authentication & User Management
- **Secure Authentication** - JWT-based sign up and sign in system
- **User Dashboard** - View and manage your created rooms
- **Protected Routes** - Secure access to drawing rooms

### 🚪 Room Management
- **Create Rooms** - Generate unique room slugs for collaboration sessions
- **Password Protection** - Optional password security for private rooms
- **Join Rooms** - Easy room joining with automatic password verification
- **Room Dashboard** - See all your created rooms with creation dates
- **Delete Rooms** - Remove rooms you no longer need (admin only)
- **Room Access Control** - Only room creators can delete their rooms

### 🎯 User Experience
- **Modern UI** - Beautiful gradient design with Tailwind CSS
- **Responsive Navigation** - Sticky navbar with smooth transitions
- **Modal Interfaces** - Clean popups for room creation and joining
- **Visual Feedback** - Lock icons for password-protected rooms
- **Quick Navigation** - Back to home button from canvas
- **Error Handling** - Clear error messages and validation

### 🏗️ Architecture
- **Monorepo Structure** - Organized with TurboRepo + PNPM workspaces
- **Shared Packages** - Reusable UI components and backend utilities
- **Type Safety** - Full TypeScript implementation across all packages
- **Database Management** - Prisma ORM with PostgreSQL
- **API Architecture** - RESTful HTTP backend + WebSocket server

---

## 🧰 Drawing Tools

| Tool | Status | Description |
|------|--------|-------------|
| Pencil | ✅ | Freehand drawing with smooth paths |
| Circle | ✅ | Perfect circles with radius control |
| Rectangle | ✅ | Rectangular shapes |
| Line | ✅ | Straight lines between two points |
| Arrow | ✅ | Directional arrows |
| Diamond | ✅ | Diamond/rhombus shapes |
| Text | ✅ | Add text with adjustable font size |
| Select | ✅ | Move and resize existing shapes |
| Eraser | ✅ | Delete shapes by clicking or dragging |

---

## 📋 Complete Feature List

### Authentication System
- ✅ User registration with email and password
- ✅ JWT token-based authentication
- ✅ Secure password hashing
- ✅ Persistent login sessions
- ✅ Protected API endpoints

### Room Features
- ✅ Create rooms with unique slugs
- ✅ Optional password protection (toggle checkbox)
- ✅ Join rooms with password verification
- ✅ View all created rooms on dashboard
- ✅ Delete rooms (admin authorization)
- ✅ Room metadata (creation date, admin info)
- ✅ Room access control

### Canvas Features
- ✅ Full-featured drawing canvas
- ✅ 8 different drawing tools
- ✅ Real-time shape synchronization
- ✅ Shape selection and manipulation
- ✅ Drag to move shapes
- ✅ Resize handles for shape adjustment
- ✅ Shape deletion with eraser
- ✅ Text input with customizable size
- ✅ Visual feedback for active tools
- ✅ Back to home navigation

### Real-time Collaboration
- ✅ WebSocket-based synchronization
- ✅ Multi-user concurrent drawing
- ✅ Instant shape updates across clients
- ✅ Real-time shape deletion sync
- ✅ Shape transformation broadcasting
- ✅ Persistent shape storage in database

### User Interface
- ✅ Modern landing page with hero section
- ✅ Feature showcase section
- ✅ Sticky navigation bar
- ✅ Gradient design theme
- ✅ Modal popups for room actions
- ✅ Icon-based toolbar
- ✅ Visual tool selection feedback
- ✅ Room grid layout on dashboard
- ✅ Password protection indicators
- ✅ Responsive design

---

## 🧰 Tech Stack

| Layer         | Technology                       | Purpose |
|--------------|----------------------------------|---------|
| Frontend      | Next.js 15, React 19            | Modern web framework with App Router |
| Styling       | Tailwind CSS                    | Utility-first CSS framework |
| UI Components | Lucide React                    | Icon library for consistent UI |
| Backend       | Node.js, Express.js             | RESTful API server |
| Real-time     | WebSocket (ws)                  | Live collaboration and updates |
| Auth          | JWT (jsonwebtoken)              | Secure token-based authentication |
| Database      | PostgreSQL                      | Relational database |
| ORM           | Prisma 6.9.0                    | Type-safe database client |
| Language      | TypeScript 5.8.2                | Type safety across the stack |
| Monorepo      | TurboRepo + PNPM                | Workspace management |
| Validation    | Zod                             | Schema validation |

---

## 🗂️ Monorepo Structure

```
Draw-app/
├── apps/
│   ├── draw-app-fe/              # Next.js Frontend Application
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── page.tsx          # Landing page with navbar & dashboard
│   │   │   ├── signin/           # Sign in page
│   │   │   ├── signup/           # Sign up page
│   │   │   └── canvas/[roomId]/  # Dynamic room canvas page
│   │   ├── components/           # React components
│   │   │   ├── AuthPage.tsx      # Authentication form
│   │   │   ├── Canvas.tsx        # Drawing toolbar & canvas wrapper
│   │   │   ├── RoomCanvas.tsx    # WebSocket connection manager
│   │   │   ├── CreateRoom.tsx    # Room creation modal
│   │   │   ├── JoinRoom.tsx      # Room joining modal
│   │   │   ├── Dashboard.tsx     # User's rooms dashboard
│   │   │   └── IconButton.tsx    # Reusable icon button
│   │   └── draw/                 # Drawing engine
│   │       ├── Game.ts           # Canvas logic & shape management
│   │       ├── TypeShape.ts      # Shape type definitions
│   │       └── http.ts           # API helper functions
│   │
│   ├── http-backend/             # Express.js REST API Server
│   │   └── src/
│   │       ├── index.ts          # API endpoints (auth, rooms, shapes)
│   │       └── middleware.ts     # JWT authentication middleware
│   │
│   └── ws-backend/               # WebSocket Server
│       └── src/
│           └── index.ts          # Real-time message handling
│
├── packages/
│   ├── db/                       # Database Package
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── migrations/       # Database migrations
│   │   └── src/
│   │       └── index.ts          # Prisma client export
│   │
│   ├── common/                   # Shared Types & Validation
│   │   └── src/
│   │       └── types.ts          # Zod schemas for validation
│   │
│   ├── backend-common/           # Backend Utilities
│   │   └── src/
│   │       └── index.ts          # Shared backend config
│   │
│   ├── ui/                       # Reusable UI Components
│   │   └── src/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── code.tsx
│   │
│   ├── eslint-config/            # Shared ESLint configs
│   └── typescript-config/        # Shared TypeScript configs
│
├── turbo.json                    # TurboRepo configuration
├── pnpm-workspace.yaml           # PNPM workspace definition
└── package.json                  # Root package configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PNPM package manager
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CyberKaps/syncDraw.git
   cd Draw-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `.env` files in the required packages:

   **`packages/db/.env`**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/syncdraw"
   ```

   **`packages/backend-common/.env`** (or set in app env)
   ```env
   JWT_SECRET="your-secret-key-here"
   ```

4. **Run database migrations**
   ```bash
   cd packages/db
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development servers**

   Open three terminal windows:

   **Terminal 1 - Frontend (Next.js)**
   ```bash
   cd apps/draw-app-fe
   pnpm dev
   # Runs on http://localhost:3000
   ```

   **Terminal 2 - HTTP Backend (Express)**
   ```bash
   cd apps/http-backend
   pnpm dev
   # Runs on http://localhost:3001
   ```

   **Terminal 3 - WebSocket Server**
   ```bash
   cd apps/ws-backend
   pnpm dev
   # Runs on ws://localhost:8080
   ```

6. **Access the application**
   
   Open your browser and navigate to `http://localhost:3000`

---

## 📊 Database Schema

### User Table
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password
- `name` - User's display name

### Room Table
- `id` - Unique identifier
- `slug` - Unique room identifier (string)
- `password` - Optional room password (nullable)
- `adminId` - Foreign key to User (room creator)
- `createdAt` - Room creation timestamp

### Chat Table (Stores Drawing Shapes)
- `id` - Unique identifier
- `roomId` - Foreign key to Room
- `userId` - Foreign key to User
- `message` - JSON string of shape data
- `createdAt` - Shape creation timestamp

---

## 🔌 API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /signin` - Authenticate and receive JWT token

### Room Management
- `POST /room` - Create a new room (requires auth)
- `GET /user/rooms` - Get all rooms created by user (requires auth)
- `DELETE /room/:slug` - Delete a room (requires auth, admin only)
- `GET /room/:slug` - Get room details
- `POST /room/verify` - Verify room password

### Canvas Data
- `GET /chats/:roomId` - Get all shapes for a room

---

## 🔄 WebSocket Events

### Client to Server
- `join_room` - Join a drawing room
- `leave_room` - Leave a drawing room
- `chat` - Send new shape to room (create)
- `update` - Send shape update (move/resize)
- `delete` - Delete a shape (eraser)

### Server to Client
- `chat` - Receive new shape from other users
- `update` - Receive shape updates from other users
- `delete` - Receive shape deletion from other users
- `error` - Error messages

---

## � Planned Enhancements

Future features and improvements planned for syncDraw:

- 🔄 **Undo/Redo** - Step backward and forward through drawing history
- 🧹 **Clear Canvas** - Remove all shapes at once
- 📤 **Export Drawings** - Save canvas as PNG/SVG
- 🎨 **Color Picker** - Choose custom colors for shapes
- 📏 **Stroke Width** - Adjust line thickness
- 👥 **User Presence** - See who's currently in the room
- 🖱️ **Live Cursors** - View other users' cursor positions in real-time
- 💬 **Chat Feature** - Text chat alongside drawing
- 📱 **Mobile Support** - Touch-optimized drawing experience
- 🌙 **Dark/Light Mode** - Theme switching
- 📋 **Shape Layers** - Z-index management for overlapping shapes
- 🔍 **Zoom & Pan** - Navigate large canvases
- 📌 **Pin Important Shapes** - Lock shapes from editing

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**CyberKaps**
- GitHub: [@CyberKaps](https://github.com/CyberKaps)
- Repository: [syncDraw](https://github.com/CyberKaps/syncDraw)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Icons from [Lucide React](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database managed with [Prisma](https://www.prisma.io/)

---

**⭐ Star this repository if you find it helpful!**