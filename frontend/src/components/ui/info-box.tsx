interface InfoBoxProps {
  title: string;
  description: string;
}

export function InfoBox({ title, description }: InfoBoxProps) {
  return (
    <div className="rounded-none border-2 border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-xs text-emerald-600">{description}</p>
    </div>
  );
}
