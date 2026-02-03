/**
 * Adaptadores defensivos para payday3_loadout_items.json
 * Objetivo: obtener listas consumibles por UI sin “casar” el shape exacto.
 */

export function normalizeLoadoutData(loadoutData) {
  const result = {
    primary: {},
    secondary: {},
    overkill: [],
    throwable: [],
    deployable: [],
    tool: [],
    armors: [],
  };

  // PRIMARY / SECONDARY
  ["primary", "secondary"].forEach(slot => {
    const byId = loadoutData?.[slot] ?? {};
    Object.values(byId).forEach(item => {
      const type = item.type; // assaultrifle, shotgun, smg, etc
      if (!result[slot][type]) result[slot][type] = [];
      result[slot][type].push(item);
    });
  });

  // RESTO (listas simples)
  if (loadoutData.overkill) {
    result.overkill = Object.values(loadoutData.overkill);
  }
  if (loadoutData.throwable) {
    result.throwable = Object.values(loadoutData.throwable);
  }
  if (loadoutData.deployable) {
    result.deployable = Object.values(loadoutData.deployable);
  }
  if (loadoutData.tool) {
    result.tool = Object.values(loadoutData.tool);
  }
  if (loadoutData.armor) {
    result.armors = Object.values(loadoutData.armor);
  }

  return result;
}


export function getWeaponByKey(loadoutData, weaponKey) {
  if (!weaponKey) return null;
  const items = flattenLoadoutItems(loadoutData);
  return items.find(i => i.key === weaponKey && isWeapon(i)) ?? null;
}

/**
 * A partir de weaponDef.mods devuelve:
 * [{ slot: "barrel", options: [{id,name}, ...] }, ...]
 */
export function getWeaponModSlots(weaponDef) {
  const mods = weaponDef?.mods;
  if (!mods) return [];

  // mods como objeto {slotName: {something}} o {slotName: [mods]}
  if (mods && typeof mods === "object" && !Array.isArray(mods)) {
    return Object.entries(mods).map(([slot, slotMods]) => ({
      slot,
      options: normalizeModsList(slotMods),
    }));
  }

  // mods como array
  if (Array.isArray(mods)) {
    // asumimos que cada mod tiene slot/slot_name
    const bySlot = {};
    for (const m of mods) {
      const slot = m?.slot ?? m?.slot_name ?? m?.type ?? "mod";
      bySlot[slot] ??= [];
      bySlot[slot].push(m);
    }
    return Object.entries(bySlot).map(([slot, arr]) => ({
      slot,
      options: normalizeModsList(arr),
    }));
  }

  return [];
}

export function buildEmptyModsStateForWeapon(weaponDef) {
  const slots = getWeaponModSlots(weaponDef);
  const state = {};
  for (const s of slots) state[s.slot] = null;
  return state;
}

export function validateWeaponMods(loadoutState, loadoutData) {
  const issues = [];
  const items = flattenLoadoutItems(loadoutData);

  for (const slotName of ["primary", "secondary"]) {
    const slot = loadoutState?.[slotName];
    if (!slot?.weaponKey) continue;

    const weapon = items.find(i => i.key === slot.weaponKey);
    if (!weapon || !isWeapon(weapon)) {
      issues.push({
        code: "WEAPON_NOT_FOUND",
        message: `Weapon ${slot.weaponKey} no encontrada`,
        meta: { slotName, weaponKey: slot.weaponKey },
      });
      continue;
    }

    const modSlots = getWeaponModSlots(weapon);
    const allowed = new Map();
    for (const ms of modSlots) {
      allowed.set(ms.slot, new Set(ms.options.map(o => Number(o.id))));
    }

    for (const [modSlot, modId] of Object.entries(slot.mods || {})) {
      if (modId == null || modId === "") continue;
      const set = allowed.get(modSlot);
      if (!set) {
        issues.push({
          code: "MOD_SLOT_INVALID",
          message: `Mod slot inválido (${slotName}): ${modSlot}`,
          meta: { slotName, modSlot },
        });
        continue;
      }
      if (!set.has(Number(modId))) {
        issues.push({
          code: "MOD_ID_INVALID",
          message: `Mod id inválido (${slotName}/${modSlot}): ${modId}`,
          meta: { slotName, modSlot, modId },
        });
      }
    }
  }

  return issues;
}

/* ------------------ internals ------------------ */

function flattenLoadoutItems(loadoutData) {
  if (!loadoutData || typeof loadoutData !== "object") return [];

  const out = [];

  // primary / secondary weapons
  ["primary", "secondary"].forEach(slot => {
    const byId = loadoutData[slot];
    if (byId && typeof byId === "object") {
      out.push(
        ...Object.values(byId).filter(
          i => i && typeof i === "object" && i.slot === slot
        )
      );
    }
  });

  // resto de categorías (listas simples)
  ["overkill", "throwable", "deployable", "tool", "armor"].forEach(cat => {
    const byId = loadoutData[cat];
    if (byId && typeof byId === "object") {
      out.push(
        ...Object.values(byId).filter(i => i && typeof i === "object")
      );
    }
  });

  return out;
}


function normalizeModsList(slotMods) {
  if (!slotMods) return [];
  if (Array.isArray(slotMods)) return slotMods.map(normalizeMod).filter(Boolean);

  if (typeof slotMods === "object") {
    // diccionario
    return Object.values(slotMods).map(normalizeMod).filter(Boolean);
  }
  return [];
}

function normalizeMod(m) {
  if (!m) return null;
  return {
    id: m.id ?? m.mod_id ?? m.key ?? null,
    name: m.name ?? m.title ?? String(m.id ?? m.key ?? "Mod"),
  };
}

function isSlot(item, slot) {
  const s = item?.slot ?? item?.weapon_slot ?? item?.type_slot;
  if (!s) return false;
  return String(s).toLowerCase() === String(slot).toLowerCase();
}

function isWeapon(item) {
  if (!item) return false;

  // En PD3, TODAS las armas tienen slot primary/secondary
  if (item.slot === "primary" || item.slot === "secondary") {
    return typeof item.key === "string";
  }

  return false;
}


function isOverkill(item) {
  const t = String(item?.type ?? item?.category ?? "").toLowerCase();
  return t.includes("overkill");
}

function isThrowable(item) {
  const t = String(item?.type ?? item?.category ?? "").toLowerCase();
  return t.includes("throwable");
}

function isDeployable(item) {
  const t = String(item?.type ?? item?.category ?? "").toLowerCase();
  return t.includes("deployable");
}

function isTool(item) {
  const t = String(item?.type ?? item?.category ?? "").toLowerCase();
  return t === "tool" || t.includes("tool");
}

function isArmor(item) {
  const t = String(item?.type ?? item?.category ?? "").toLowerCase();
  return t === "armor" || t.includes("armor");
}
