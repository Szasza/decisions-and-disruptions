import { type JSX, useId } from "react";

export interface InputProps {
  id?: string;
  name?: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function Input({
  id,
  name,
  label,
  value,
  defaultValue,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  autoFocus,
  disabled,
}: InputProps): JSX.Element {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm text-slate-300">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        // biome-ignore lint/a11y/noAutofocus: consumer-controlled, opt-in prop per this atom's contract
        autoFocus={autoFocus}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
      {error && (
        <p id={errorId} className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
