"use client";

import { ChangeEventHandler, useCallback, useState } from "react";
import { TextareaFormField } from "../_data/steps";
import clsx from "clsx";

type TextAreaProps = TextareaFormField & {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
};

export function TextArea({
  label,
  placeholder,
  required,
  onChange,
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <div className="w-full">
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
          required && "required"
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
      />
    </div>
  );
}
