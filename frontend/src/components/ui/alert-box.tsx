import { cn } from "../../lib/utils/cn";

interface AlertBoxProps {
  message: string;
  type?: "error" | "warning";
}

export function AlertBox({ message, type = "error" }: AlertBoxProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        type === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      {message}
    </div>
  );
}
