import type {
  Constraints,
  DrawingData,
  InverterSelection,
  LayoutResult,
  ModuleSelection,
  SizingIntent,
  YieldResult
} from "./types";

const sampleModules: ModuleSelection[] = [
  {
    id: "mock-400",
    name: "Mock Mono 400W",
    powerW: 400,
    widthM: 1.05,
    heightM: 1.95,
    source: "dataset"
  },
  {
    id: "mock-450",
    name: "Mock Mono 450W",
    powerW: 450,
    widthM: 1.1,
    heightM: 2.1,
    source: "dataset"
  }
];

const sampleInverter: InverterSelection = {
  mode: "auto",
  inverterId: "mock-inverter",
  name: "Mock Inverter 5kW",
  acPowerW: 5000,
  dcAcRatio: 1.2,
  mpptCount: 2
};

const sampleLayout: LayoutResult = {
  panels: [
    { id: "p1", polygon: [[0, 0], [0, 1.9], [1.0, 1.9], [1.0, 0]] },
    { id: "p2", polygon: [[1.1, 0], [1.1, 1.9], [2.1, 1.9], [2.1, 0]] }
  ],
  panelCount: 2,
  coveragePercent: 12,
  systemSizeKw: 0.8
};

const sampleYield: YieldResult = {
  annualKwh: 1200,
  monthlyKwh: [80, 90, 110, 120, 130, 140, 150, 140, 120, 110, 90, 80]
};

export const mockApi = {
  getModules: async () => sampleModules,
  suggestInverter: async (_systemKw: number, _module: ModuleSelection) => sampleInverter,
  generateLayout: async (
    _drawing: DrawingData,
    _sizing: SizingIntent,
    _module: ModuleSelection,
    _constraints: Constraints
  ) => sampleLayout,
  estimateYield: async (_layout: LayoutResult) => sampleYield,
  exportProject: async (_format: string) => new Blob(["Mock export"], { type: "text/plain" })
};
