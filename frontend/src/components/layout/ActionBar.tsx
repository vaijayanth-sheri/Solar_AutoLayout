import { LoadingIndicator } from "../ui/loading-indicator";

interface ActionBarProps {
  onBack: () => void;
  onNext: () => void;
  loading: boolean;
  hasBack: boolean;
  hasNext: boolean;
}

export function ActionBar({ onBack, onNext, loading, hasBack, hasNext }: ActionBarProps) {
  return (
    <div className="sticky bottom-0 w-full border-t border-slate-200 bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        {loading ? <LoadingIndicator label="Saving & moving to next step..." /> : <div />}
        <div className="flex gap-3">
          {hasBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="rounded-none border-2 border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
            >
              Back
            </button>
          )}
          {hasNext ? (
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="rounded-none bg-brand-primary px-6 py-2 text-sm font-semibold text-white shadow-none hover:opacity-90 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
             <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="rounded-none bg-brand-primary px-6 py-2 text-sm font-semibold text-white shadow-none hover:opacity-90 disabled:opacity-50"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
