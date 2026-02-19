export function getItemNameByKey(key, loadoutData) {
  if (!key) return "—";

  const categories = [
    "primary",
    "secondary",
    "overkill",
    "throwable",
    "deployable",
    "tool",
    "armors",
  ];

  for (const category of categories) {
    const items = loadoutData?.[category];
    if (!items) continue;

    const match = Object.values(items).find(
      (item) => item.key === key
    );

    if (match) return match.name;
  }

  return key; // fallback
}
