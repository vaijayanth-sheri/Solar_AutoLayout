import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
}

export function Dropdown({ label, hint, className, children, ...props }: DropdownProps) {
  return (
    <label className="block space-y-1 text-sm text-slate-600">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        {...props}
        className={cn(
          "w-full rounded-none border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-none focus:border-brand-primary focus:outline-none focus:ring-0",
          className
        )}
      >
        {children}
      </select>
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}
