// src/data/index.js

import {
  armorTypes,
  plateTypes,
  armorPlateCount,
  randomArmor
} from "./armor.js";

import { throwables, deployables, tools } from "./equipment.js";
import { heists } from "./heists.js";
import { weapons } from "./weapons.js";

// Helper random simple
export const r = (list, rng = Math.random) =>
  list[Math.floor(rng() * list.length)];

// Re-export de datos para uso externo
export {
  armorTypes,
  plateTypes,
  armorPlateCount,
  randomArmor,
  throwables,
  deployables,
  tools,
  heists,
  weapons
};

// Dataset derivado para mapear por categoría de arma
const primaryWeapons = weapons.filter(w => w.category === "primary");
const secondaryWeapons = weapons.filter(w => w.category === "secondary");

// Map de fuentes por categoría del build
export const sourceMap = {
  primary: primaryWeapons,      // array de objetos { name, type, category }
  secondary: secondaryWeapons,  // idem

  // Overkill se sigue manejando como strings planos
  overkill: [
    "Marcom Mamba MGL",
    "HET-5 Red Fox",
    "M135 Arges",
    "Interceptor",
    "Sociopath"
  ],

  throwable: throwables,
  deployable: deployables,
  tool: tools,
  heist: heists
};
