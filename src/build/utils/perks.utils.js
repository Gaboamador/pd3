export function isIconicWeapon(weaponDef) {
  return weaponDef?.preset === 1;
}

export function getPerkByKey(perksData, perkKey) {
  if (!perkKey) return null;
  return perksData?.[perkKey] ?? null;
}

export function getWeaponPerks(perksData, weaponType) {
  if (!weaponType) return [];

  return Object.values(perksData ?? {})
    .filter((perk) => {
      if (perk?.scope !== "weapon") return false;
      if (perk.iconicOnly) return false;

      return (
        Array.isArray(perk.weaponTypes) &&
        perk.weaponTypes.includes(weaponType)
      );
    })
    .sort((a, b) => (a.name ?? a.key).localeCompare(b.name ?? b.key));
}

export function getEffectiveWeaponPerkKey(weaponState, weaponDef) {
  if (!weaponDef) return null;

  if (isIconicWeapon(weaponDef)) {
    return weaponDef.perk ?? weaponState?.perk ?? null;
  }

  return weaponState?.perk ?? null;
}

export function getOverkillConfigGroups(perksData, weaponKey) {
  if (!weaponKey) return [];

  const bySlot = new Map();

  Object.values(perksData ?? {}).forEach((option) => {
    if (option?.scope !== "overkill") return;
    if (option.weaponKey !== weaponKey) return;
    if (!option.slotKey) return;

    if (!bySlot.has(option.slotKey)) {
      bySlot.set(option.slotKey, {
        slotKey: option.slotKey,
        slotLabel: option.slotLabel ?? option.slotKey,
        slotIndex: Number.isFinite(Number(option.slotIndex))
          ? Number(option.slotIndex)
          : 999,
        optionType: option.optionType ?? "perk",
        options: [],
      });
    }

    bySlot.get(option.slotKey).options.push(option);
  });

  const groups = Array.from(bySlot.values());

  groups.forEach((group) => {
    group.options.sort((a, b) => {
      if (Boolean(a.isDefault) !== Boolean(b.isDefault)) {
        return a.isDefault ? -1 : 1;
      }
      return (a.name ?? a.key).localeCompare(b.name ?? b.key);
    });
  });

  groups.sort((a, b) => {
    if (a.slotIndex !== b.slotIndex) return a.slotIndex - b.slotIndex;
    return a.slotLabel.localeCompare(b.slotLabel);
  });

  return groups;
}

export function buildInitialOverkillConfig(perksData, weaponKey) {
  const config = {};

  getOverkillConfigGroups(perksData, weaponKey).forEach((group) => {
    const defaultOption = group.options.find((option) => option.isDefault);
    config[group.slotKey] = defaultOption?.key ?? null;
  });

  return config;
}

export function getEffectiveOverkillConfig(config, perksData, weaponKey) {
  return {
    ...buildInitialOverkillConfig(perksData, weaponKey),
    ...(config && typeof config === "object" ? config : {}),
  };
}

export function getSelectedOverkillOptionKeys(config) {
  if (!config || typeof config !== "object") return [];
  return Object.values(config).filter(Boolean);
}

export function findWeaponDefinition(loadoutData, slot, weaponKey) {
  if (!weaponKey) return null;
  const section = loadoutData?.[slot];
  if (!section || typeof section !== "object") return null;

  return Object.values(section).find((item) => item?.key === weaponKey) ?? null;
}

export function findOverkillDefinition(loadoutData, weaponKey) {
  return findWeaponDefinition(loadoutData, "overkill", weaponKey);
}

export function validateLoadoutPerks(loadoutState, loadoutData, perksData) {
  const issues = [];

  for (const slotName of ["primary", "secondary"]) {
    const weaponState = loadoutState?.[slotName];
    if (!weaponState?.weaponKey) continue;

    const weaponDef = findWeaponDefinition(loadoutData, slotName, weaponState.weaponKey);
    if (!weaponDef) continue;

    const selectedKey = getEffectiveWeaponPerkKey(weaponState, weaponDef);
    if (!selectedKey) continue;

    const perk = getPerkByKey(perksData, selectedKey);
    if (!perk || perk.scope !== "weapon") {
      issues.push({
        code: "WEAPON_PERK_UNKNOWN",
        message: `Perk inválida (${slotName}): ${selectedKey}`,
        meta: { slotName, weaponKey: weaponState.weaponKey, perkKey: selectedKey },
      });
      continue;
    }

    if (isIconicWeapon(weaponDef)) {
      if (weaponDef.perk && selectedKey !== weaponDef.perk) {
        issues.push({
          code: "ICONIC_PERK_MISMATCH",
          message: `La Iconic ${weaponDef.key} requiere la perk ${weaponDef.perk}`,
          meta: {
            slotName,
            weaponKey: weaponDef.key,
            expectedPerk: weaponDef.perk,
            actualPerk: selectedKey,
          },
        });
      }
      continue;
    }

    if (!Array.isArray(perk.weaponTypes) || !perk.weaponTypes.includes(weaponDef.type)) {
      issues.push({
        code: "WEAPON_PERK_TYPE_MISMATCH",
        message: `Perk ${selectedKey} no válida para ${weaponDef.type}`,
        meta: {
          slotName,
          weaponKey: weaponDef.key,
          weaponType: weaponDef.type,
          perkKey: selectedKey,
        },
      });
    }
  }

  const overkillKey = loadoutState?.overkill;
  const overkillConfig = loadoutState?.overkillConfig;

  if (overkillConfig && typeof overkillConfig === "object") {
    for (const [slotKey, optionKey] of Object.entries(overkillConfig)) {
      if (!optionKey) continue;

      const option = getPerkByKey(perksData, optionKey);
      if (!option || option.scope !== "overkill") {
        issues.push({
          code: "OVERKILL_OPTION_UNKNOWN",
          message: `Opción Overkill inválida: ${optionKey}`,
          meta: { weaponKey: overkillKey, slotKey, optionKey },
        });
        continue;
      }

      if (option.weaponKey !== overkillKey || option.slotKey !== slotKey) {
        issues.push({
          code: "OVERKILL_OPTION_MISMATCH",
          message: `Opción ${optionKey} no corresponde a ${overkillKey}/${slotKey}`,
          meta: {
            weaponKey: overkillKey,
            slotKey,
            optionKey,
            optionWeaponKey: option.weaponKey,
            optionSlotKey: option.slotKey,
          },
        });
      }
    }
  }

  return issues;
}
