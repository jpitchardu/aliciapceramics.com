"use client";

import { HTMLInputTypeAttribute, useCallback } from "react";
import clsx from "clsx";
import { useState } from "react";

type TextInputProps = {
  label: string;
  placeholder: string;
  value?: string;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const TextInput = ({
  label,
  placeholder,
  value,
  required,
  type = "text",
  onChange,
}: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <div className=" w-full">
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
      <input
        type={type}
        className="aliciap-input"
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
