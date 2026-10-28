"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  id?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function MultiSelect({
  id,
  options,
  value,
  onChange,
  disabled,
  placeholder = "Select co-authors",
}: MultiSelectProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => new Set(value), [value]);
  const selectedLabels = useMemo(
    () => options.filter((option) => selected.has(option.value)).map((option) => option.label),
    [options, selected],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const summary = selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder;

  return (
    <div className="multi-select" ref={rootRef}>
      <button
        id={triggerId}
        type="button"
        className="multi-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selectedLabels.length > 0 ? "multi-select-summary" : "multi-select-placeholder"}>
          {summary}
        </span>
        <span className="multi-select-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {open ? (
        <ul id={listboxId} className="multi-select-panel" role="listbox" aria-multiselectable="true">
          {options.map((option) => {
            const isSelected = selected.has(option.value);
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <label className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => {
                      if (isSelected) {
                        onChange(value.filter((entry) => entry !== option.value));
                        return;
                      }

                      onChange([...value, option.value]);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
