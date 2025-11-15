# 🎨 Drawing Engine Architecture

## 📁 File Structure

The Game.ts file has been refactored from **939 lines** into **5 focused modules** for better organization and maintainability.

```
draw/
├── Game.ts                 (~550 lines) - Main orchestrator
├── managers/
│   ├── DrawingRenderer.ts  (~180 lines) - Canvas rendering
│   ├── ShapeManager.ts     (~170 lines) - Shape geometry & selection
│   ├── ShapeTransformer.ts (~100 lines) - Shape move/resize operations
│   ├── ZoomPanManager.ts   (~95 lines)  - Zoom & pan controls
│   └── WebSocketHandler.ts (~115 lines) - Real-time collaboration
├── TypeShape.ts            - Shape type definitions
├── http.ts                 - HTTP API calls
└── Game.backup2.ts         - Original backup
```

---

## 🎯 Module Responsibilities

### **Game.ts** - Main Orchestrator
**Purpose:** Coordinates all modules and handles user interactions

**What it does:**
- Creates and initializes all manager modules
- Handles mouse events (click, move, drag)
- Manages drawing state (current tool, active shape)
- Coordinates shape creation workflow
- Provides public API for UI components

**Key Methods:**
- `setTool()` - Change active drawing tool
- `setZoom()` / `resetView()` - View controls
- `clearAllShapes()` - Clear canvas
- Mouse event handlers

---

### **DrawingRenderer.ts** - Canvas Rendering
**Purpose:** Handles all canvas drawing operations

**What it does:**
- Clears and redraws canvas
- Renders shapes (rect, circle, line, arrow, diamond, text, pencil)
- Draws selection handles
- Applies zoom/pan transformations

**Key Methods:**
- `clearCanvas()` - Main render loop
- `drawShape()` - Render single shape
- `drawHandles()` - Draw resize handles

---

### **ShapeManager.ts** - Shape Geometry
**Purpose:** Manages shape calculations and selection

**What it does:**
- Calculates bounding boxes for all shape types
- Detects which shape is clicked
- Checks if point is inside shape
- Handles proximity detection

**Key Methods:**
- `getBoundingBox()` - Get shape bounds
- `pickShapeAt()` - Find shape at coordinates
- `getHandlesForShape()` - Get 8 resize handles
- `genId()` - Generate unique IDs

---

### **ShapeTransformer.ts** - Shape Operations
**Purpose:** Handles shape transformations

**What it does:**
- Moves shapes to new position
- Resizes shapes via handles
- Maintains shape integrity during operations

**Key Methods:**
- `moveShape()` - Translate shape position
- `resizeShape()` - Resize via handle dragging

---

### **ZoomPanManager.ts** - View Transformations
**Purpose:** Manages canvas zoom and pan

**What it does:**
- Tracks zoom level (0.1x - 5x)
- Manages pan offset
- Converts screen ↔ canvas coordinates
- Handles panning state

**Key Methods:**
- `setZoom()` - Update zoom level
- `setPan()` - Update pan offset
- `screenToCanvas()` - Convert coordinates
- `startPanning()` / `updatePanning()` / `stopPanning()`

---

### **WebSocketHandler.ts** - Networking
**Purpose:** Handles real-time collaboration

**What it does:**
- Sends shape updates to server
- Receives updates from other users
- Broadcasts deletions and clear actions
- Validates incoming data

**Key Methods:**
- `sendShapeUpdate()` - Broadcast shape
- `sendShapeDelete()` - Broadcast deletion
- `sendClearAll()` - Clear for all users

---

## 🔄 Data Flow

### Creating a Shape
```
User draws → mouseDown → mouseMove (preview) → mouseUp
                                                   ↓
                                        createShapeFromTool()
                                                   ↓
                                        existingShapes.push()
                                                   ↓
                                    WebSocketHandler.sendShapeUpdate()
                                                   ↓
                                        DrawingRenderer.clearCanvas()
```

### Selecting & Dragging
```
User clicks → mouseDown → ShapeManager.pickShapeAt()
                                   ↓
                          Set draggingShape
                                   ↓
                     DrawingRenderer (shows handles)

User drags → mouseMove → ShapeTransformer.moveShape()
                                   ↓
                     WebSocketHandler.sendShapeUpdate()
                                   ↓
                        DrawingRenderer.clearCanvas()
```

### Real-time Collaboration
```
WebSocket Message
        ↓
WebSocketHandler.onmessage
        ↓
Parse & validate shape
        ↓
Game.handleShapeUpdate()
        ↓
Update existingShapes array
        ↓
DrawingRenderer.clearCanvas()
```

---

## ✨ Benefits

### 🎯 **Separation of Concerns**
- Each module has ONE clear job
- Rendering separate from networking
- Geometry calculations isolated

### 📖 **Improved Readability**
- Main Game.ts: 939 → 550 lines (42% reduction)
- Average module size: ~130 lines
- Clear, focused files

### 🔧 **Easier Maintenance**
- Bug in rendering? → Check `DrawingRenderer.ts`
- Selection issue? → Check `ShapeManager.ts`
- Zoom problem? → Check `ZoomPanManager.ts`
- Network bug? → Check `WebSocketHandler.ts`

### 🧪 **Better Testability**
- Each module can be tested independently
- Mock dependencies easily
- Unit test individual features

### 🚀 **Easy Extensions**
- Add new shape type? → Update ShapeManager + DrawingRenderer
- Add new feature? → Create new manager
- All changes localized

---

## 📊 Before vs After

| Metric | Before | After | Change |
|--------|---------|-------|--------|
| **Main file** | 939 lines | 550 lines | -41% |
| **Modules** | 1 file | 6 files | Better organized |
| **Avg file size** | 939 lines | ~135 lines | -86% |
| **Circular deps** | Possible | None | ✅ Clean |
| **Documentation** | Minimal | Comprehensive | ✅ |

---

## 🛠️ How to Use

### Adding a New Shape Type

1. **Update TypeShape.ts** - Add type definition
2. **Update ShapeManager.ts:**
   - Add to `getBoundingBox()`
   - Add to `isPointInShape()`
3. **Update DrawingRenderer.ts:**
   - Add to `drawShape()`
4. **Update Game.ts:**
   - Add to `createShapeFromTool()`
   - Add to `drawLivePreview()`

### Modifying Zoom Behavior

Just edit **ZoomPanManager.ts** - all zoom logic is isolated there!

### Changing Rendering Style

Just edit **DrawingRenderer.ts** - colors, line widths, shadows, etc.

---

## 🔄 Migration Notes

- ✅ All features work exactly as before
- ✅ Same public API
- ✅ No breaking changes
- ✅ Original file backed up as `Game.backup2.ts`

---

## 📝 Quick Reference

| Need to... | Check this file |
|------------|----------------|
| Add new shape type | ShapeManager + DrawingRenderer + Game |
| Change rendering style | DrawingRenderer |
| Modify zoom/pan | ZoomPanManager |
| Update network protocol | WebSocketHandler |
| Add keyboard shortcut | Game → initKeyboardHandlers() |
| Fix selection bug | ShapeManager |
| Adjust drag behavior | ShapeTransformer |

---

**Refactored:** November 15, 2025  
**Original size:** 939 lines  
**New total:** ~1,210 lines (across 6 files)  
**Status:** ✅ All tests passing, zero errors
