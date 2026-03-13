import { useTranslation } from "react-i18next";
import { getWeaponModSlots } from "../../utils/loadout.utils";

export default function WeaponModsEditor({ weaponDef, modsState, onChangeMods }) {
  const { t } = useTranslation();
  const modSlots = getWeaponModSlots(weaponDef);

  if (!modSlots.length) {
    return <div style={{ opacity: 0.8 }}>{t('build.loadout.msg.no-mods-available')}</div>;
  }

  function setMod(slot, id) {
    onChangeMods({
      ...modsState,
      [slot]: id === "" ? null : Number(id),
    });
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 600 }}>{t('build.loadout.weapon.mods')}</div>

      {modSlots.map(ms => (
        <label key={ms.slot} style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>{ms.slot}</span>
          <select
            value={modsState?.[ms.slot] ?? ""}
            onChange={e => setMod(ms.slot, e.target.value)}
          >
            <option value="">{t('select.option.default')}</option>
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
