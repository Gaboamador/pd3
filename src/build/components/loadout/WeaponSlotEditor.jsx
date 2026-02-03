import { useMemo, useState, useEffect } from "react";
import WeaponModsEditor from "./WeaponModsEditor";
import { getWeaponTypeLabel, WEAPON_TYPE_ORDER } from "../../utils/weaponTypes.utils";

/**
 * Props:
 * - label: "Primary" | "Secondary"
 * - itemsByType: { [weaponType]: WeaponDef[] }
 * - value: { weaponKey: string|null, mods: {} }
 * - onChange: fn(nextValue)
 */
export default function WeaponSlotEditor({
  label,
  itemsByType,
  value,
  onChange,
}) {
  // weaponType se deriva del arma seleccionada, si existe
  const derivedType = useMemo(() => {
    if (!value.weaponKey) return "";
    for (const [type, weapons] of Object.entries(itemsByType)) {
      if (weapons.some(w => w.key === value.weaponKey)) {
        return type;
      }
    }
    return "";
  }, [value.weaponKey, itemsByType]);

  const [weaponType, setWeaponType] = useState(derivedType);

  // mantener sincronizado si el build viene cargado (import / reset)
  useEffect(() => {
    setWeaponType(derivedType);
  }, [derivedType]);

  const weaponsOfType = weaponType ? itemsByType[weaponType] ?? [] : [];

  const weaponDef = useMemo(() => {
    if (!weaponType || !value.weaponKey) return null;
    return weaponsOfType.find(w => w.key === value.weaponKey) ?? null;
  }, [weaponType, weaponsOfType, value.weaponKey]);

  function handleWeaponTypeChange(type) {
    setWeaponType(type);
    // al cambiar tipo, se resetea el arma y los mods
    onChange({
      weaponKey: null,
      preset: 0,
      mods: {},
    });
  }

  function handleWeaponChange(key) {
    if (!key) {
      onChange({ weaponKey: null, preset: 0,mods: {} });
      return;
    }

    const def =
      weaponsOfType.find(w => w.key === key) ?? null;

    const emptyMods = {};
    if (def?.mods) {
      Object.keys(def.mods).forEach(slot => {
        emptyMods[slot] = null;
      });
    }

    onChange({
      weaponKey: key,
      preset: def?.preset ?? 0,
      mods: emptyMods,
    });

  }

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        padding: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 10,
      }}
    >
      <div style={{ fontWeight: 700 }}>{label}</div>

      {/* Weapon type */}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 600 }}>Weapon type</span>
        <select
          value={weaponType}
          onChange={e => handleWeaponTypeChange(e.target.value)}
        >
          <option value="">—</option>
          {WEAPON_TYPE_ORDER
            .filter(type => itemsByType[type])
            .map(type => (
              <option key={type} value={type}>
                {getWeaponTypeLabel(type)}
              </option>
            ))}
        </select>
      </label>

      {/* Weapon */}
      {weaponType && (
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Weapon</span>
          <select
            value={value.weaponKey ?? ""}
            onChange={e => handleWeaponChange(e.target.value)}
          >
            <option value="">—</option>
            {weaponsOfType.map(w => (
              <option key={w.key} value={w.key}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Mods */}
      {weaponDef && weaponDef.mods && (
        <WeaponModsEditor
          weaponDef={weaponDef}
          modsState={value.mods || {}}
          onChangeMods={mods =>
            onChange({
              ...value,
              mods,
            })
          }
        />
      )}
    </div>
  );
}
