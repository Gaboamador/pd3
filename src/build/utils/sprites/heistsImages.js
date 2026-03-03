// src/build/utils/heistImages.js

// Importa todas las webp de la carpeta
// const modules = import.meta.glob(
//   "../../assets/heists/*.webp",
//   { eager: true, import: "default" }
// );
const modules = import.meta.glob(
  "/src/assets/heists/*.webp",
  { eager: true, import: "default" }
);

// Normaliza nombre del heist → nombre de archivo
function normalizeHeistName(name) {
  if (!name) return "";
  return name
    .replace(/&/g, "And")
    .replace(/\s+/g, "_");
}

// Construimos mapa: "No Rest For The Wicked" → url
export const heistImages = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => {
    const fileName = path.split("/").pop().replace(".webp", "");
    const key = fileName.replace(/_/g, " ");
    return [key, url];
  })
);

// Helper opcional
export function getHeistImage(heistName) {
  if (!heistName) return null;

  const normalized = normalizeHeistName(heistName);
  const restoredKey = normalized.replace(/_/g, " ");

  return heistImages[restoredKey] ?? null;
}