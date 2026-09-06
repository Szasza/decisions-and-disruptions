"use client";

import { type FormEvent, type JSX, useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";

export interface DisplayNameFormProps {
  action: (displayName: string) => void | Promise<void>;
  initialError?: string;
  submitLabel?: string;
}

export function DisplayNameForm({
  action,
  initialError,
  submitLabel = "Join room",
}: DisplayNameFormProps): JSX.Element {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    setError(undefined);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter a display name");
      return;
    }

    setIsSubmitting(true);
    try {
      await action(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Display name"
        value={value}
        onChange={handleChange}
        error={error}
        autoFocus
      />
      <Button type="submit" loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
