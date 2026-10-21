import { useId, useMemo, useState } from "react";
import { searchWeaponPerks } from "./utils/searchWeaponPerks";
import styles from "./WeaponPerkSearchPicker.module.scss";

/** Selector buscable de Weapon Perks. `value` almacena la key, no el texto ingresado. */
export default function WeaponPerkSearchPicker({ id, label, perks, value, onChange }) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selected = perks.find((perk) => perk.key === value);
  const visiblePerks = useMemo(() => searchWeaponPerks(perks, query), [perks, query]);

  function select(perk) {
    onChange(perk.key);
    setQuery(perk.name);
    setOpen(false);
    setActiveIndex(-1);
  }

  function close() {
    setOpen(false);
    setActiveIndex(-1);
    setQuery(selected?.name ?? "");
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        close();
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (!visiblePerks.length) return;
      setActiveIndex((current) => {
        if (!open) return event.key === "ArrowDown" ? 0 : visiblePerks.length - 1;
        return event.key === "ArrowDown"
          ? (current + 1) % visiblePerks.length
          : (current <= 0 ? visiblePerks.length - 1 : current - 1);
      });
      return;
    }
    if (event.key === "Enter" && open && activeIndex >= 0 && visiblePerks[activeIndex]) {
      event.preventDefault();
      select(visiblePerks[activeIndex]);
    }
  }

  return (
    <div
      className={styles.wrapper}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.control}>
        <input
          id={id}
          type="search"
          autoComplete="off"
          className={styles.input}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeIndex >= 0 && visiblePerks[activeIndex]
            ? `${listId}-${visiblePerks[activeIndex].key}` : undefined}
          placeholder="Search Weapon Perk..."
          value={open ? query : selected?.name ?? query}
          onFocus={(event) => {
            setQuery(selected?.name ?? "");
            setOpen(true);
            setActiveIndex(-1);
            event.target.select();
          }}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
            if (value) onChange("");
          }}
          onKeyDown={handleKeyDown}
        />
        {open && (
          <div id={listId} role="listbox" className={styles.results} aria-label={label}>
            {visiblePerks.length ? visiblePerks.map((perk, index) => (
              <button
                key={perk.key}
                id={`${listId}-${perk.key}`}
                className={`${styles.option} ${index === activeIndex ? styles.active : ""}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => select(perk)}
              >
                {perk.name}
              </button>
            )) : <span className={styles.empty}>No matching Weapon Perks</span>}
          </div>
        )}
      </div>
    </div>
  );
}
