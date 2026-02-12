import { getWeaponModSlots } from "../../utils/loadout.utils";
import { WEAPON_MOD_SLOT_SPRITES } from "../../utils/sprites/weaponModSlotMap";
import WeaponModSprite from "./WeaponModSprite";
import styles from "./WeaponModSlotsRow.module.scss";

export default function WeaponModSlotsRow({ weaponDef, modsState, height }) {
  if (!weaponDef) return null;

  const modSlots = getWeaponModSlots(weaponDef);

  if (!modSlots.length) return null;

  return (
    <div className={styles.row}>
      {modSlots.map(ms => {
        const spritePos = WEAPON_MOD_SLOT_SPRITES[ms.slot];
        if (!spritePos) return null;

        // const isActive = modsState?.[ms.slot] != null;
        const v = modsState?.[ms.slot] ?? null;
        const isActive = v != null && v !== "";

        return (
          <div key={ms.slot} className={styles.icon}>
            <div className={isActive ? styles.active : styles.inactive}>
                <WeaponModSprite
                spritePos={spritePos}
                height={height}
                />
            </div>
          </div>
        );
      })}
    </div>
  );
}
