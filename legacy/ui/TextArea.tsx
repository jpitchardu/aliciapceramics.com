"use client";

import { ChangeEventHandler, useCallback, useState } from "react";
import clsx from "clsx";

type TextAreaProps = {
  label: string;
  placeholder: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  value?: string;
  required?: boolean;
  containerClassName?: string;
};

export function TextArea({
  label,
  placeholder,
  value,
  required,
  onChange,
  containerClassName,
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <div className={clsx("flex flex-col gap-1 w-full", containerClassName)}>
      <label
        className={clsx(
          [
            "form-label",
            "transition-all",
            "duration-300",
            "text-sm",
            "font-label",
            "text-earth-dark",
          ],
          isFocused && "label-focused",
          required && "required",
        )}
      >
        {label}
      </label>
      <textarea
        className="aliciap-textarea w-full aliciap-input"
        placeholder={placeholder}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
      />
    </div>
  );
}
