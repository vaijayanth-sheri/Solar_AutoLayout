export type Mode = "map" | "image";

export type LatLng = [number, number];

export interface PolygonFeature {
  id: string;
  coordinates: LatLng[];
}

export interface LineFeature {
  id: string;
  coordinates: LatLng[];
}

export interface DrawingData {
  mode: Mode;
  installable: PolygonFeature[];
  obstacles: PolygonFeature[];
  referenceLine?: LineFeature | null;
  referenceLengthM?: number | null;
  location?: { lat: number; lon: number } | null;
  image?: {
    dataUrl: string;
    width: number;
    height: number;
  } | null;
  imageBearing?: number | null; // 0 = Top of image is North
  mapCenter?: LatLng | null;
}

export type SizingType = "kwp" | "kwh" | "panel_count" | "max_fill";

export interface SizingIntent {
  type: SizingType;
  value?: number | null;
}

export interface ModuleSelection {
  id: string;
  name: string;
  manufacturer?: string;
  powerW: number;
  widthM: number;
  heightM: number;
  source: "dataset" | "custom";
}

export interface InverterSelection {
  mode: "auto" | "manual";
  inverterId?: string;
  name?: string;
  acPowerW?: number;
  dcAcRatio?: number;
  targetRatio?: number;
  mpptCount?: number;
}

export interface Constraints {
  moduleOrientation: "portrait" | "landscape";
  azimuth: number;
  tilt: number;
  panelSpacingX: number;
  panelSpacingY: number;
  obstacleBufferM: number;
  edgeClearanceM: number;
  thermalRows: number;
  thermalCols: number;
  thermalGapM: number;
  albedo: number;
  systemLossPercent: number;
}

export interface PanelLayout {
  id: string;
  polygon: LatLng[];
}

export interface LayoutResult {
  panels: PanelLayout[];
  panelCount: number;
  coveragePercent: number;
  systemSizeKw: number;
}

export interface YieldResult {
  annualKwh: number;
  monthlyKwh: number[];
  specificYield?: number;
  performanceRatio?: number;
  capacityFactor?: number;
  totalLossPercent?: number;
  co2SavingsKg?: number;
  treesEquivalent?: number;
  acCapacityKw?: number;
  dcAcRatio?: number;
  peakMonth?: string;
  lowMonth?: string;
  systemInsight?: string;
}

export interface ProjectData {
  drawing: DrawingData | null;
  sizing: SizingIntent | null;
  module: ModuleSelection | null;
  inverter: InverterSelection | null;
  constraints: Constraints | null;
  layout: LayoutResult | null;
  yield: YieldResult | null;
}
