import axios from "axios";
import type {
  Constraints,
  DrawingData,
  InverterSelection,
  LayoutResult,
  ModuleSelection,
  SizingIntent,
  YieldResult
} from "./types";
import { mockApi } from "./mockApi";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

const client = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});

export const api = {
  getModules: async (): Promise<ModuleSelection[]> => {
    if (useMock) return mockApi.getModules();
    const response = await client.get("/api/modules");
    return response.data;
  },
  getInverters: async (): Promise<InverterSelection[]> => {
    if (useMock) return []; // Mock not implemented for inverters
    const response = await client.get("/api/inverters");
    return response.data;
  },
  suggestInverter: async (
    systemKw: number,
    module: ModuleSelection,
    targetRatio?: number
  ): Promise<InverterSelection> => {
    if (useMock) return mockApi.suggestInverter(systemKw, module);
    const response = await client.post("/api/inverters/suggest", { systemKw, module, targetRatio });
    return response.data;
  },
  generateLayout: async (
    drawing: DrawingData,
    sizing: SizingIntent,
    module: ModuleSelection,
    constraints: Constraints
  ): Promise<LayoutResult> => {
    if (useMock) return mockApi.generateLayout(drawing, sizing, module, constraints);
    const response = await client.post("/api/layout/generate", {
      drawing,
      sizing,
      module,
      constraints
    });
    return response.data;
  },
  estimateYield: async (
    layout: LayoutResult,
    constraints: Constraints,
    location?: { lat: number; lon: number },
    inverter?: InverterSelection
  ): Promise<YieldResult> => {
    if (useMock) return mockApi.estimateYield(layout);
    const response = await client.post("/api/yield/estimate", { layout, constraints, location, inverter });
    return response.data;
  },
  exportProject: async (
    format: "dxf" | "pdf" | "png" | "csv" | "json",
    payload: Record<string, unknown>
  ): Promise<Blob> => {
    if (useMock) return mockApi.exportProject(format);
    const response = await client.post(`/api/exports/${format}`, payload, {
      responseType: "blob"
    });
    return response.data;
  }
};
