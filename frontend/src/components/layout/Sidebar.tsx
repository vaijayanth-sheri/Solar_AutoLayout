import { cn } from "../../lib/utils/cn";
import { useProjectStore } from "../../lib/store/projectStore";

const steps = [
  "Mode & Drawing",
  "Sizing Intent",
  "Module Selection",
  "Inverter Configuration",
  "Constraints",
  "Layout Generation",
  "Yield & Report",
  "Export"
];

export function Sidebar() {
  const currentStep = useProjectStore((state) => state.currentStep);
  const setCurrentStep = useProjectStore((state) => state.setCurrentStep);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-brand-text">Solar Auto Layout</h1>
        <p className="mt-1 text-xs text-slate-500">Workflow 1-8</p>
      </div>
      <nav className="flex-1 space-y-2">
        {steps.map((label, index) => {
          const step = index + 1;
          return (
            <button
              type="button"
              key={label}
              onClick={() => setCurrentStep(step)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                currentStep === step
                  ? "bg-emerald-50 text-brand-primary"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                  currentStep === step
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-slate-200 text-slate-500"
                )}
              >
                {step}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
