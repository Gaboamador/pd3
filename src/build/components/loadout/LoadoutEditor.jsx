import WeaponSlotEditor from "./WeaponSlotEditor";
import ArmorEditor from "./ArmorEditor";

export default function LoadoutEditor({
  build,
  setBuild,
  loadoutNormalized,
  platesData,
  loadoutData,
}) {
  const { weaponsPrimary, weaponsSecondary, overkill, throwable, deployable, tool, armors } =
    loadoutNormalized;

  function updateLoadout(patch) {
    setBuild(prev => ({
      ...prev,
      loadout: {
        ...prev.loadout,
        ...patch,
      },
    }));
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 700 }}>Weapons</div>

<WeaponSlotEditor
  label="Primary"
  itemsByType={loadoutNormalized.primary}
  value={build.loadout.primary}
  onChange={val => updateLoadout({ primary: val })}
/>

<WeaponSlotEditor
  label="Secondary"
  itemsByType={loadoutNormalized.secondary}
  value={build.loadout.secondary}
  onChange={val => updateLoadout({ secondary: val })}
/>

      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 700 }}>Equipment</div>

        <SelectItem
          label="Overkill"
          value={build.loadout.overkill}
          items={overkill}
          onChange={key => updateLoadout({ overkill: key })}
        />

        <SelectItem
          label="Throwable"
          value={build.loadout.throwable}
          items={throwable}
          onChange={key => updateLoadout({ throwable: key })}
        />

        <SelectItem
          label="Deployable"
          value={build.loadout.deployable}
          items={deployable}
          onChange={key => updateLoadout({ deployable: key })}
        />

        <SelectItem
          label="Tool"
          value={build.loadout.tool}
          items={tool}
          onChange={key => updateLoadout({ tool: key })}
        />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 700 }}>Armor</div>
        <ArmorEditor
          value={build.loadout.armor}
          armors={armors}
          platesData={platesData}
          loadoutData={loadoutData}
          onChange={armor => updateLoadout({ armor })}
        />
      </div>
    </div>
  );
}

function SelectItem({ label, value, items, onChange }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <select value={value ?? ""} onChange={e => onChange(e.target.value || null)}>
        <option value="">—</option>
        {items.map(it => (
          <option key={it.key} value={it.key}>
            {it.name ?? it.key}
          </option>
        ))}
      </select>
    </label>
  );
}
