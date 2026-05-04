import { create } from "zustand";
import type {
  Constraints,
  DrawingData,
  InverterSelection,
  LayoutResult,
  ProjectData,
  SizingIntent,
  YieldResult
} from "../types";

interface ProjectStore {
  currentStep: number;
  draft: ProjectData;
  saved: ProjectData;
  setCurrentStep: (step: number) => void;
  updateDrawingDraft: (data: DrawingData) => void;
  updateSizingDraft: (data: SizingIntent) => void;
  updateModuleDraft: (data: ProjectData["module"]) => void;
  updateInverterDraft: (data: InverterSelection) => void;
  updateConstraintsDraft: (data: Constraints) => void;
  saveSection: (section: keyof ProjectData) => void;
  setLayoutResult: (layout: LayoutResult) => void;
  setYieldResult: (yieldResult: YieldResult) => void;
  clearResults: () => void;
}

const defaultConstraints: Constraints = {
  moduleOrientation: "portrait",
  azimuth: 180,
  tilt: 20,
  panelSpacingX: 0.02,
  panelSpacingY: 0.02,
  obstacleBufferM: 0.3,
  edgeClearanceM: 0.4,
  thermalRows: 10,
  thermalCols: 20,
  thermalGapM: 0.08,
  albedo: 0.2,
  systemLossPercent: 14.0
};

const defaultDrawing: DrawingData = {
  mode: "map",
  installable: [],
  obstacles: [],
  referenceLine: null,
  referenceLengthM: null,
  location: null,
  image: null,
  imageBearing: 0,
  mapCenter: [52.52, 13.405]
};

const defaultSizing: SizingIntent = {
  type: "max_fill",
  value: null
};

const defaultInverter: InverterSelection = {
  mode: "auto",
  inverterId: null,
  name: null,
  acPowerW: null,
  dcAcRatio: null,
  mpptCount: null
};

const buildDefaultProject = (): ProjectData => ({
  drawing: defaultDrawing,
  sizing: defaultSizing,
  module: null,
  inverter: defaultInverter,
  constraints: defaultConstraints,
  layout: null,
  yield: null
});

export const useProjectStore = create<ProjectStore>((set) => ({
  currentStep: 1,
  draft: buildDefaultProject(),
  saved: buildDefaultProject(),
  setCurrentStep: (step) => set({ currentStep: step }),
  updateDrawingDraft: (data) =>
    set((state) => ({ draft: { ...state.draft, drawing: data } })),
  updateSizingDraft: (data) =>
    set((state) => ({ draft: { ...state.draft, sizing: data } })),
  updateModuleDraft: (data) =>
    set((state) => ({ draft: { ...state.draft, module: data } })),
  updateInverterDraft: (data) =>
    set((state) => ({ draft: { ...state.draft, inverter: data } })),
  updateConstraintsDraft: (data) =>
    set((state) => ({ draft: { ...state.draft, constraints: data } })),
  saveSection: (section) =>
    set((state) => ({
      saved: { ...state.saved, [section]: state.draft[section] }
    })),
  setLayoutResult: (layout) =>
    set((state) => ({
      draft: { ...state.draft, layout },
      saved: { ...state.saved, layout }
    })),
  setYieldResult: (yieldResult) =>
    set((state) => ({
      draft: { ...state.draft, yield: yieldResult },
      saved: { ...state.saved, yield: yieldResult }
    })),
  clearResults: () =>
    set((state) => ({
      draft: { ...state.draft, layout: null, yield: null },
      saved: { ...state.saved, layout: null, yield: null }
    }))
}));
