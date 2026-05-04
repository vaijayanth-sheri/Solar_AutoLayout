import type { DrawingData } from "./types";

export function toBackendDrawing(drawing: DrawingData): DrawingData {
  // We no longer swap coordinates here. 
  // The backend geometry service now handles [lat, lng] ordering for both Map and Image modes.
  return drawing;
}
