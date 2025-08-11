"use client";

import clsx from "clsx";
import { ChangeEventHandler, useCallback, useState } from "react";

type SelectProps = {
  label: string;
  options: string[];
  required: boolean;
  onChange: ChangeEventHandler<HTMLSelectElement>;
};
export function Select({ label, options, required, onChange }: SelectProps) {
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
      <select
        className="aliciap-select w-full aliciap-input"
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
