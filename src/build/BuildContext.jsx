import { createContext, useContext } from "react";

/**
 * Context opcional: útil si más adelante querés evitar prop drilling.
 * En esta versión lo dejamos “listo”, pero BuildEditor puede funcionar sin usarlo.
 */
const BuildContext = createContext(null);

export function BuildProvider({ value, children }) {
  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) {
    throw new Error("useBuild debe usarse dentro de <BuildProvider />");
  }
  return ctx;
}
