import { cn } from "../../lib/utils/cn";

interface ToggleOption {
  label: string;
  value: string;
}

interface ToggleButtonsProps {
  label: string;
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
}

export function ToggleButtons({ label, options, value, onChange }: ToggleButtonsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-none border-2 px-4 py-2 text-sm font-medium transition",
              value === option.value
                ? "border-brand-primary bg-brand-primary text-white shadow-none"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-primary hover:text-brand-primary"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
