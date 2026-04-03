# 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Canvas Component                      │
│                   (React - Canvas.tsx)                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Creates & Controls
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      Game.ts                             │
│               (Main Orchestrator - 550 lines)            │
│                                                          │
│  • Coordinates all managers                             │
│  • Handles user input (mouse/keyboard)                  │
│  • Manages drawing state                                │
│  • Public API for UI                                    │
└──────┬──────────┬──────────┬──────────┬────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐
│ Drawing  │ │  Shape   │ │  Shape   │ │ ZoomPan  │ │ WebSocket  │
│ Renderer │ │ Manager  │ │Transform.│ │ Manager  │ │  Handler   │
│          │ │          │ │          │ │          │ │            │
│ 180 lines│ │ 170 lines│ │ 100 lines│ │  95 lines│ │  115 lines │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────────┘
```

## 📦 Module Dependencies

```
Game.ts
  ├─ uses → DrawingRenderer
  │           (renders shapes, handles, canvas)
  │
  ├─ uses → ShapeManager
  │           (geometry, selection, bounding boxes)
  │
  ├─ uses → ShapeTransformer (depends on ShapeManager)
  │           (move/resize operations)
  │
  ├─ uses → ZoomPanManager
  │           (zoom level, pan offset, coordinate conversion)
  │
  └─ uses → WebSocketHandler
              (real-time sync, broadcasts)

✅ No circular dependencies!
✅ All managers are independent
✅ Clean, testable architecture
```

## 🔄 Common Operations

### 1️⃣ Drawing a Rectangle
```
User Action          Game.ts              Modules               Output
───────────          ───────              ───────               ──────
MouseDown     ─────> mouseDownHandler
                    (stores startX/Y)

MouseMove     ─────> mouseMoveHandler ──> DrawingRenderer  ─> Live
                    drawLivePreview()     .drawShape()         preview

MouseUp       ─────> mouseUpHandler
                    Creates rect shape
                         │
                         ├──────────────> WebSocketHandler ─> Broadcast
                         │                .sendShapeUpdate()    to server
                         │
                         └──────────────> DrawingRenderer  ─> Final
                                          .clearCanvas()        render
```

### 2️⃣ Selecting & Dragging
```
User Clicks          Game.ts              Modules               Output
───────────          ───────              ───────               ──────
Click shape   ─────> mouseDownHandler ──> ShapeManager     ─> Find shape
                                          .pickShapeAt()        at coords
                    Sets draggingShape
                         │
                         └──────────────> DrawingRenderer  ─> Show
                                          .clearCanvas()        handles

Drag shape    ─────> mouseMoveHandler
                    Checks threshold
                         │
                         ├──────────────> ShapeTransformer ─> Move
                         │                .moveShape()          shape
                         │
                         ├──────────────> WebSocketHandler ─> Broadcast
                         │                .sendShapeUpdate()    update
                         │
                         └──────────────> DrawingRenderer  ─> Redraw
                                          .clearCanvas()
```

### 3️⃣ Zooming
```
User Scroll          Game.ts              Modules               Output
───────────          ───────              ───────               ──────
Mouse wheel   ─────> wheelHandler    ──> ZoomPanManager    ─> Update
                    Calculates delta     .setZoom()            zoom
                         │
                         ├──────────────> ZoomPanManager    ─> Adjust
                         │                .setPan()             pan to
                         │                                      cursor
                         │
                         └──────────────> DrawingRenderer  ─> Render
                                          .clearCanvas()        at new
                                                                zoom
```

### 4️⃣ Real-time Collaboration
```
Network              WebSocketHandler     Game.ts               Output
───────              ────────────────     ───────               ──────
Message    ────────> onmessage handler
arrives                   │
                          ├─ Validates shape
                          │
                          └──────────────> Game callbacks
                                          .handleShapeUpdate()
                                          Updates shapes array
                                                │
                                                └─────────────> DrawingRenderer
                                                                .clearCanvas()
```

## 📊 Module Communication

```
┌────────────────────────────────────────────────────────────┐
│                         Game.ts                             │
│                     (Central Hub)                           │
└─┬────────┬────────┬────────┬────────┬────────┬────────────┘
  │        │        │        │        │        │
  │        │        │        │        │        │
  ▼        ▼        ▼        ▼        ▼        ▼
┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐┌────────────┐
│Render ││Shape  ││Trans- ││Zoom   ││Web    ││Canvas.tsx  │
│       ││Mgr    ││former ││Pan    ││Socket ││(React UI)  │
└───────┘└───────┘└───────┘└───────┘└───────┘└────────────┘
    ↑        ↑        │        ↑        ↑
    │        │        │        │        │
    │        └────────┘        │        │
    │    (Transformer          │        │
    │     depends on            │        │
    │     ShapeManager)         │        │
    │                           │        │
    └───────────────────────────┴────────┘
         (All communicate through Game.ts)
```

## 🎯 Design Principles Applied

### ✅ Single Responsibility Principle
Each module has ONE job:
- DrawingRenderer → Rendering
- ShapeManager → Geometry
- ShapeTransformer → Transformations
- ZoomPanManager → View state
- WebSocketHandler → Networking

### ✅ Dependency Inversion
- Game.ts depends on abstractions (modules)
- Modules don't know about Game.ts
- Easy to swap implementations

### ✅ Open/Closed Principle
- Open for extension (add new modules)
- Closed for modification (existing modules stable)

### ✅ Low Coupling
- Modules are independent
- Only Game.ts connects them
- Changes don't ripple through system

### ✅ High Cohesion
- Related code stays together
- Each module is self-contained
- Clear boundaries

---

**Pro Tip:** When debugging, follow the arrows in the diagrams to understand data flow!
