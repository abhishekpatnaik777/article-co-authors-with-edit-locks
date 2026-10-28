"use client";

import { useMemo } from "react";

type Option = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
};

export function MultiSelect({ options, value, onChange, disabled }: MultiSelectProps) {
  const selected = useMemo(() => new Set(value), [value]);

  return (
    <div className="multi-select">
      {options.map((option) => {
        const isSelected = selected.has(option.value);
        return (
          <label key={option.value} className="multi-select-option">
            <input
              type="checkbox"
              checked={isSelected}
              disabled={disabled}
              onChange={(event) => {
                if (event.target.checked) {
                  onChange([...value, option.value]);
                  return;
                }

                onChange(value.filter((entry) => entry !== option.value));
              }}
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}