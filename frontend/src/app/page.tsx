"use client";

import { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { ActionBar } from "../components/layout/ActionBar";
import { Step1Drawing } from "../components/steps/Step1Drawing";
import { Step2Sizing } from "../components/steps/Step2Sizing";
import { Step3Module } from "../components/steps/Step3Module";
import { Step4Inverter } from "../components/steps/Step4Inverter";
import { Step5Constraints } from "../components/steps/Step5Constraints";
import { Step6Layout } from "../components/steps/Step6Layout";
import { Step7Yield } from "../components/steps/Step7Yield";
import { Step8Export } from "../components/steps/Step8Export";
import { AlertBox } from "../components/ui/alert-box";
import { api } from "../lib/api";
import { toBackendDrawing } from "../lib/geometry";
import { useProjectStore } from "../lib/store/projectStore";
import { validateConstraints, validateDrawing, validateModule, validateSizing } from "../lib/validation";

const stepComponents = {
  1: Step1Drawing,
  2: Step2Sizing,
  3: Step3Module,
  4: Step4Inverter,
  5: Step5Constraints,
  6: Step6Layout,
  7: Step7Yield,
  8: Step8Export
};

export default function Home() {
  const currentStep = useProjectStore((state) => state.currentStep);
  const setCurrentStep = useProjectStore((state) => state.setCurrentStep);
  const draft = useProjectStore((state) => state.draft);
  const saved = useProjectStore((state) => state.saved);
  const saveSection = useProjectStore((state) => state.saveSection);
  const updateDrawingDraft = useProjectStore((state) => state.updateDrawingDraft);
  const setLayoutResult = useProjectStore((state) => state.setLayoutResult);
  const setYieldResult = useProjectStore((state) => state.setYieldResult);
  const clearResults = useProjectStore((state) => state.clearResults);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const StepComponent = stepComponents[currentStep as keyof typeof stepComponents];

  const handleSave = async (goNext: boolean) => {
    setError(null);
    setLoading(true);
    try {
      if (currentStep === 1 && draft.drawing) {
        const result = validateDrawing(draft.drawing);
        if (!result.success) throw new Error(result.message);
        const normalizedDrawing = {
          ...draft.drawing,
          location:
            draft.drawing.mode === "map" && draft.drawing.mapCenter
              ? { lat: draft.drawing.mapCenter[0], lon: draft.drawing.mapCenter[1] }
              : draft.drawing.location
        };
        updateDrawingDraft(normalizedDrawing);
        saveSection("drawing");
        clearResults();
      }
      if (currentStep === 2 && draft.sizing) {
        const result = validateSizing(draft.sizing);
        if (!result.success) throw new Error(result.message);
        saveSection("sizing");
        clearResults();
      }
      if (currentStep === 3) {
        const result = validateModule(draft.module);
        if (!result.success) throw new Error(result.message);
        saveSection("module");
        clearResults();
      }
      if (currentStep === 4 && draft.inverter) {
        if (draft.inverter.mode === "manual") {
          if (!draft.inverter.name || !draft.inverter.acPowerW) {
            throw new Error("Manual inverter selection requires name and AC power.");
          }
        }
        saveSection("inverter");
      }
      if (currentStep === 5) {
        const result = validateConstraints(draft.constraints);
        if (!result.success) throw new Error(result.message);
        saveSection("constraints");
        clearResults();
      }
      if (currentStep === 6) {
        if (!saved.layout && !draft.layout) {
          throw new Error("You must click 'Generate Layout' before proceeding.");
        }
        if (draft.layout) {
          saveSection("layout");
        }
      }
      if (currentStep === 7) {
        if (!saved.layout) {
          throw new Error("Generate a layout before estimating yield.");
        }
        if (!saved.drawing && !draft.drawing) {
          throw new Error("Drawing data is missing.");
        }
        const sourceDrawing = draft.drawing ?? saved.drawing;
        if (!sourceDrawing) {
          throw new Error("Drawing data is missing.");
        }
        const location =
          sourceDrawing.mode === "map" && sourceDrawing.mapCenter
            ? { lat: sourceDrawing.mapCenter[0], lon: sourceDrawing.mapCenter[1] }
            : sourceDrawing.location ?? undefined;
        const yieldResult = await api.estimateYield(saved.layout, saved.constraints, location);
        setYieldResult(yieldResult);
      }

      if (goNext) {
        setCurrentStep(Math.min(8, currentStep + 1));
      }
    } catch (err) {
      setError((err as Error).message ?? "Unable to save step.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-background text-brand-text">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 space-y-6 px-8 pb-28 pt-8">
          {error ? <AlertBox message={error} /> : null}
          {StepComponent ? <StepComponent /> : null}
        </main>
        <ActionBar 
          onBack={() => setCurrentStep(Math.max(1, currentStep - 1))} 
          onNext={() => handleSave(true)} 
          loading={loading} 
          hasBack={currentStep > 1}
          hasNext={currentStep < 8}
        />
      </div>
    </div>
  );
}
