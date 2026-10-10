"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import styles from "./Contact.module.css";

// The "What do you need?" picker: a designed listbox instead of the native select.
// It keeps the form contract (a hidden input named "package") and the listbox
// keyboard model: arrows move, Enter or Space picks, Escape closes, letters jump.

type Option = { id: string; name: string };
type Group = { label: string; items: Option[] };

export function PackageSelect({
  value,
  onChange,
  groups,
  none,
  other,
  invalid,
}: {
  value: string;
  onChange: (id: string) => void;
  groups: Group[];
  none: string;
  other: string;
  invalid?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  // One flat list for keyboard movement; groups are only visual.
  const flat: Option[] = [{ id: "", name: none }, ...groups.flatMap((g) => g.items), { id: "other", name: other }];
  const selected = flat.find((o) => o.id === value) ?? flat[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  // Keep the active option in view while moving with the keyboard.
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };
  const pick = (index: number) => {
    onChange(flat[index].id);
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent) => {
    const current = flat.indexOf(selected);
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openAt(current);
      }
      return;
    }
    if (e.key === "ArrowDown") setActive((a) => Math.min(flat.length - 1, a + 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(flat.length - 1);
    else if (e.key === "Enter" || e.key === " ") pick(active);
    else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      return;
    } else if (e.key.length === 1) {
      const from = active + 1;
      const hit = [...flat.slice(from), ...flat.slice(0, from)].find((o) => o.name.toLowerCase().startsWith(e.key.toLowerCase()));
      if (hit) setActive(flat.indexOf(hit));
      return;
    } else return;
    e.preventDefault();
  };

  let index = 0;
  const option = (o: Option) => {
    const i = index++;
    return (
      <li
        key={o.id || "none"}
        id={`${id}-o${i}`}
        role="option"
        data-index={i}
        aria-selected={o.id === selected.id}
        data-active={i === active || undefined}
        className={styles.option}
        onMouseEnter={() => setActive(i)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => pick(i)}
      >
        <span>{o.name}</span>
        {o.id === selected.id && <span className={styles.optionCheck} aria-hidden />}
      </li>
    );
  };

  return (
    <div ref={root} className={styles.select} data-open={open || undefined}>
      <input type="hidden" name="package" value={value} />
      <button
        type="button"
        id={id}
        className={styles.selectButton}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-o${active}` : undefined}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openAt(flat.indexOf(selected)))}
        onKeyDown={onKey}
      >
        <span className={styles.selectValue} data-placeholder={!value || undefined}>
          {selected.name}
        </span>
        <span className={styles.selectChevron} aria-hidden />
      </button>
      {open && (
        <ul ref={list} id={`${id}-list`} role="listbox" aria-labelledby={id} className={styles.listbox} tabIndex={-1}>
          {option(flat[0])}
          {groups.map((g) => (
            <li key={g.label} role="presentation">
              <span className={styles.groupLabel} aria-hidden>
                {g.label}
              </span>
              <ul role="group" aria-label={g.label} className={styles.group}>
                {g.items.map(option)}
              </ul>
            </li>
          ))}
          {option(flat[flat.length - 1])}
        </ul>
      )}
    </div>
  );
}
