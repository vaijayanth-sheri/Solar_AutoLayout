import type { ReactNode } from "react";
import { cn } from "../../lib/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-none border-2 border-slate-200 bg-brand-surface p-6 shadow-none", className)}>
      {children}
    </div>
  );
}
