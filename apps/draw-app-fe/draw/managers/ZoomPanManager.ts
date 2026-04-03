/**
 * Handles zoom and pan transformations for the canvas
 */
export class ZoomPanManager {
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private minZoom = 0.1;
  private maxZoom = 5;

  getZoom(): number {
    return this.zoom;
  }

  getPanX(): number {
    return this.panX;
  }

  getPanY(): number {
    return this.panY;
  }

  getIsPanning(): boolean {
    return this.isPanning;
  }

  /**
   * Set zoom level (clamped between min and max)
   */
  setZoom(newZoom: number) {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
  }

  /**
   * Set pan offset
   */
  setPan(x: number, y: number) {
    this.panX = x;
    this.panY = y;
  }

  /**
   * Start panning operation
   */
  startPanning(clientX: number, clientY: number) {
    this.isPanning = true;
    this.panStartX = clientX - this.panX;
    this.panStartY = clientY - this.panY;
  }

  /**
   * Update pan position during drag
   */
  updatePanning(clientX: number, clientY: number) {
    if (this.isPanning) {
      this.panX = clientX - this.panStartX;
      this.panY = clientY - this.panStartY;
    }
  }

  /**
   * Stop panning operation
   */
  stopPanning() {
    this.isPanning = false;
  }

  /**
   * Reset zoom and pan to defaults
   */
  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }

  /**
   * Convert screen coordinates to canvas coordinates (accounting for zoom/pan)
   */
  screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    const x = (screenX - this.panX) / this.zoom;
    const y = (screenY - this.panY) / this.zoom;
    return { x, y };
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
    const x = canvasX * this.zoom + this.panX;
    const y = canvasY * this.zoom + this.panY;
    return { x, y };
  }
}
