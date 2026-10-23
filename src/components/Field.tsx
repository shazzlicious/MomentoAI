import type { ReactNode } from "react";

export const inputCls =
  "min-h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-base text-foreground aria-[invalid=true]:border-destructive";

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <p id={`${id}-error`} className="min-h-4 text-sm text-destructive" aria-live="polite">
        {error}
      </p>
    </div>
  );
}

export const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
