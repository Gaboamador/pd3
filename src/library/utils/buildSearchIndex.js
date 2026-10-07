import { normalize } from "./normalize";
import {
  findWeaponDefinition,
  getEffectiveOverkillConfig,
  getEffectiveWeaponPerkKey,
  getSelectedOverkillOptionKeys,
} from "../../build/utils/perks.utils";

/**
 * Construye un índice estructurado para un build.
 * Se ejecuta UNA VEZ cuando se cargan los builds.
 */
export function buildSearchIndex(build, ctx = {}) {
  const index = {
    skills: {
      base: new Set(),
      aced: new Set(),
    },

    loadout: {
      primary: build.loadout?.primary?.weaponKey ?? null,
      secondary: build.loadout?.secondary?.weaponKey ?? null,
      overkill: build.loadout?.overkill ?? null,
      throwable: build.loadout?.throwable ?? null,
      deployable: build.loadout?.deployable ?? null,
      tool: build.loadout?.tool ?? null,
    },

    armor: {
      key: build.loadout?.armor?.key ?? null,
      plates: build.loadout?.armor?.plates ?? [],
    },

    perks: new Set(),
    overkillOptions: new Set(),

    nameTokens: normalize(build.name).split(/\s+/).filter(Boolean),
  };

  // Skills
  Object.entries(build.skills ?? {}).forEach(([key, state]) => {
    if (state?.base) index.skills.base.add(key);
    if (state?.aced) index.skills.aced.add(key);
  });

  // Weapon perks. For old Iconic builds, derive the fixed perk from weapon data.
  for (const slotName of ["primary", "secondary"]) {
    const weaponState = build.loadout?.[slotName];
    const weaponDef = findWeaponDefinition(
      ctx.loadoutData,
      slotName,
      weaponState?.weaponKey
    );
    const perkKey = getEffectiveWeaponPerkKey(weaponState, weaponDef);
    if (perkKey) index.perks.add(perkKey);
  }

  // Overkill config is data-driven. Actual perks and ammo share the same source
  // file but remain distinguishable for filtering/presentation.
  const effectiveOverkillConfig = getEffectiveOverkillConfig(
    build.loadout?.overkillConfig,
    ctx.perksData,
    build.loadout?.overkill
  );

  getSelectedOverkillOptionKeys(effectiveOverkillConfig).forEach((key) => {
    const def = ctx.perksData?.[key];
    if (def?.optionType === "ammo") index.overkillOptions.add(key);
    else index.perks.add(key);
  });

  return index;
}

/**
 * Enriquecer lista de builds con índice interno
 */
export function attachSearchIndexToBuilds(builds, ctx = {}) {
  return builds.map(build => ({
    ...build,
    __searchIndex: buildSearchIndex(build, ctx),
  }));
}
