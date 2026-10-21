/**
 * Catálogo de opciones reales de una Weapon Perk, separadas por slot.
 * Las armas normales se agrupan por weaponType; cada Iconic tiene una perk fija
 * y representa una opción individual. OVERKILL queda fuera de esta búsqueda.
 *
 * Los datos se inyectan para mantener la lógica verificable sin React.
 */
export function getWeaponPerkSources(perk, loadoutData) {
  if (perk?.scope !== 'weapon' || perk.optionType !== 'perk' || !perk.key) {
    return [];
  }

  const results = [];
  const allowedTypes = new Set(
    !perk.iconicOnly && Array.isArray(perk.weaponTypes) ? perk.weaponTypes : []
  );

  for (const slot of ['primary', 'secondary']) {
    const weapons = Object.values(loadoutData?.[slot] ?? {});
    const regularTypes = new Map();
    const iconics = [];

    for (const weapon of weapons) {
      if (!weapon?.key) continue;

      if (weapon.preset === 1) {
        if (weapon.perk === perk.key) {
          iconics.push({
            kind: 'iconic',
            slot,
            key: weapon.key,
            name: weapon.name ?? weapon.key,
            perkKey: perk.key,
          });
        }
        continue;
      }

      // No inferir disponibilidad en armas desconocidas o sin type.
      if (weapon.preset !== 0 || !allowedTypes.has(weapon.type)) continue;
      const typeGroup = regularTypes.get(weapon.type);
      if (typeGroup) {
        typeGroup.count += 1;
      } else {
        regularTypes.set(weapon.type, {
          kind: 'type',
          slot,
          key: `${slot}:${weapon.type}`,
          weaponType: weapon.type,
          name: weapon.name ?? weapon.key, // útil si es la única del tipo
          count: 1,
          perkKey: perk.key,
        });
      }
    }

    results.push(...regularTypes.values());
    results.push(...iconics);
  }

  return results;
}

/**
 * Pares válidos de UNA Primary y UNA Secondary que aportan ambas perks.
 * Se prueban ambos sentidos de asignación porque pueden ser diferentes.
 * Nunca enumera cada arma dentro de un grupo 'Any weaponType'.
 */
export function findWeaponPerkCombinations(firstPerk, secondPerk, loadoutData) {
  if (!firstPerk?.key || !secondPerk?.key || firstPerk.key === secondPerk.key) {
    return [];
  }

  const sourcesA = getWeaponPerkSources(firstPerk, loadoutData);
  const sourcesB = getWeaponPerkSources(secondPerk, loadoutData);
  const results = [];
  const seen = new Set();

  function appendPairs(primarySources, secondarySources) {
    for (const primary of primarySources) {
      if (primary.slot !== 'primary') continue;
      for (const secondary of secondarySources) {
        if (secondary.slot !== 'secondary') continue;
        const id = `${primary.perkKey}/${primary.key}|${secondary.perkKey}/${secondary.key}`;
        if (seen.has(id)) continue;
        seen.add(id);
        results.push({ primary, secondary });
      }
    }
  }

  appendPairs(sourcesA, sourcesB);
  appendPairs(sourcesB, sourcesA);
  return results;
}
