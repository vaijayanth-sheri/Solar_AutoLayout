import { z } from "zod";
import type { Constraints, DrawingData, ModuleSelection, SizingIntent } from "./types";

export const drawingSchema = z.object({
  mode: z.enum(["map", "image"]),
  installable: z.array(z.object({ id: z.string(), coordinates: z.array(z.tuple([z.number(), z.number()])).min(3) })).min(1),
  obstacles: z.array(z.object({ id: z.string(), coordinates: z.array(z.tuple([z.number(), z.number()])).min(3) })),
  referenceLine: z
    .object({ id: z.string(), coordinates: z.array(z.tuple([z.number(), z.number()])).min(2) })
    .nullable()
    .optional(),
  referenceLengthM: z.number().positive().nullable().optional(),
  location: z.object({ lat: z.number(), lon: z.number() }).nullable().optional(),
  image: z
    .object({ dataUrl: z.string(), width: z.number().positive(), height: z.number().positive() })
    .nullable()
    .optional()
});

export const sizingSchema = z.object({
  type: z.enum(["kwp", "kwh", "panel_count", "max_fill"]),
  value: z.number().positive().nullable().optional()
});

export const moduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  powerW: z.number().positive(),
  widthM: z.number().positive(),
  heightM: z.number().positive(),
  source: z.enum(["dataset", "custom"])
});

export function validateDrawing(data: DrawingData) {
  const parsed = drawingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Invalid drawing data." };
  }
  if (data.mode === "image") {
    if (!data.image || !data.referenceLine || !data.referenceLengthM) {
      return { success: false, message: "Image mode requires an upload, reference line, and length." };
    }
  }
  return { success: true };
}

export function validateSizing(data: SizingIntent) {
  const parsed = sizingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Invalid sizing intent." };
  }
  if (data.type !== "max_fill" && (!data.value || data.value <= 0)) {
    return { success: false, message: "Sizing value is required for this mode." };
  }
  return { success: true };
}

export function validateModule(data: ModuleSelection | null) {
  if (!data) {
    return { success: false, message: "Module selection is required." };
  }
  const parsed = moduleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Invalid module data." };
  }
  return { success: true };
}

export function validateConstraints(c: Constraints) {
  if (!c.moduleOrientation) return { success: false, message: "Module orientation is required." };
  if (c.azimuth < 0 || c.azimuth > 359) return { success: false, message: "Azimuth must be between 0 and 359 degrees." };
  if (c.tilt < 0 || c.tilt > 90) return { success: false, message: "Tilt must be between 0 and 90 degrees." };
  if (c.panelSpacingX < 0 || c.panelSpacingY < 0) return { success: false, message: "Spacing cannot be negative." };
  if (c.obstacleBufferM < 0) return { success: false, message: "Obstacle buffer cannot be negative." };
  if (c.edgeClearanceM < 0) return { success: false, message: "Edge clearance cannot be negative." };
  if (c.thermalRows <= 0 || c.thermalCols <= 0) return { success: false, message: "Thermal block sizes must be at least 1." };
  if (c.thermalGapM < 0) return { success: false, message: "Thermal gap cannot be negative." };
  return { success: true };
}
