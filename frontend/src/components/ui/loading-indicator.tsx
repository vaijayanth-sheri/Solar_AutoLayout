export function LoadingIndicator({ label = "Working..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-primary" />
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  );
}
