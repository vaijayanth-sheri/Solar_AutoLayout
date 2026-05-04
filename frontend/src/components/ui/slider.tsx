import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueLabel?: string;
}

export function Slider({ label, valueLabel, className, ...props }: SliderProps) {
  return (
    <label className="block space-y-2 text-sm text-slate-600">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-700">{label}</span>
        {valueLabel ? <span className="text-xs text-slate-400">{valueLabel}</span> : null}
      </div>
      <input
        type="range"
        {...props}
        className={cn("w-full accent-brand-primary", className)}
      />
    </label>
  );
}
