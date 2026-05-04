import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function InputField({ label, hint, className, ...props }: InputFieldProps) {
  return (
    <label className="block space-y-1 text-sm text-slate-600">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className={cn(
          "w-full rounded-none border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-none focus:border-brand-primary focus:outline-none focus:ring-0",
          className
        )}
      />
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}
