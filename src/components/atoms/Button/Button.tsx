import type { ButtonHTMLAttributes, JSX } from "react";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: "primary" | "secondary";
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-sky-500 text-slate-950 hover:bg-sky-400",
  secondary:
    "border border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-500 hover:bg-slate-700",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps): JSX.Element {
  const classes = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
