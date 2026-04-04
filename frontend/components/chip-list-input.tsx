"use client";

import { KeyboardEvent, useState } from "react";

export function ChipListInput({
  label,
  placeholder,
  items,
  maxItems,
  onChange
}: {
  label: string;
  placeholder: string;
  items: string[];
  maxItems: number;
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addItem(rawValue: string) {
    const value = rawValue.trim();
    if (!value || items.length >= maxItems) {
      return;
    }

    if (items.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }

    onChange([...items, value]);
    setDraft("");
  }

  function removeItem(target: string) {
    onChange(items.filter((item) => item !== target));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addItem(draft);
    }

    if (event.key === "Backspace" && !draft && items.length > 0) {
      event.preventDefault();
      removeItem(items[items.length - 1]);
    }
  }

  return (
    <label className="block">
      <span className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--outline)]">
        {label}
      </span>
      <div className="mt-2 rounded-xl border border-[var(--outline-variant)] bg-white px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold text-[var(--on-surface-variant)]"
              onClick={() => removeItem(item)}
              type="button"
            >
              <span>{item}</span>
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          ))}
          {items.length < maxItems ? (
            <input
              className="min-w-24 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => addItem(draft)}
              placeholder={placeholder}
              value={draft}
            />
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
        Press `Enter` or `,` to add. Max {maxItems}.
      </p>
    </label>
  );
}
