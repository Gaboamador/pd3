import { getWeaponModSlots } from "../../utils/loadout.utils";

export default function WeaponModsEditor({ weaponDef, modsState, onChangeMods }) {
  const modSlots = getWeaponModSlots(weaponDef);

  if (!modSlots.length) {
    return <div style={{ opacity: 0.8 }}>No mods disponibles</div>;
  }

  function setMod(slot, id) {
    onChangeMods({
      ...modsState,
      [slot]: id === "" ? null : Number(id),
    });
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 600 }}>Mods</div>

      {modSlots.map(ms => (
        <label key={ms.slot} style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>{ms.slot}</span>
          <select
            value={modsState?.[ms.slot] ?? ""}
            onChange={e => setMod(ms.slot, e.target.value)}
          >
            <option value="">Default</option>
            {ms.options.map(o => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
