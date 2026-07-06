import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
