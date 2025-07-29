import { IconSelectFormField } from "@/app/commisions/_data/steps";
import clsx from "clsx";
import { useState } from "react";

type IconSelectProps = IconSelectFormField & {
  onChange: (value: string) => void;
};
export default function IconSelect({
  label,
  options,
  onChange,
}: IconSelectProps) {
  const [selected, setSelected] = useState<string>();

  const handleSelect = (label: string) => {
    setSelected(label);
    onChange(label);
  };

  return (
    <div>
      <label htmlFor={label} className="font-body text-sm mb-1 text-earth-dark">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.label}
            className={clsx([
              "pottery-option",
              selected === option.label && "selected",
            ])}
            onClick={() => handleSelect(option.label)}
          >
            <span className="pottery-icon">{option.icon}</span>
            <span className="pottery-label font-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
