export const armorTypes = ["Specialist", "Saboteur", "Mercenary", "Medtech"];
export const plateTypes = ["Resistant", "Adaptive", "Impact"];

export const armorPlateCount = {
  Medtech: 1,
  Specialist: 2,
  Saboteur: 3,
  Mercenary: 4
};

export function randomArmor(rng = Math.random) {
  const type = armorTypes[Math.floor(rng() * armorTypes.length)];
  const count = armorPlateCount[type];
  const plates = [];

  for (let i = 0; i < count; i++) {
    plates.push(plateTypes[Math.floor(rng() * plateTypes.length)]);
  }

  // Shuffle (Fisher-Yates)
  for (let i = plates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [plates[i], plates[j]] = [plates[j], plates[i]];
  }

  return { type, plates };
}
