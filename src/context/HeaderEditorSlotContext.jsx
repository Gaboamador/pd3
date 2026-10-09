import { createContext, useContext, useMemo, useState } from "react";

// Permite montar controles propios del Build Editor en el Header sin
// sacar del editor el estado ni sus handlers.
const HeaderEditorSlotContext = createContext(null);

export function HeaderEditorSlotProvider({ children }) {
  const [editorSlot, setEditorSlot] = useState(null);
  const value = useMemo(() => ({ editorSlot, setEditorSlot }), [editorSlot]);

  return (
    <HeaderEditorSlotContext.Provider value={value}>
      {children}
    </HeaderEditorSlotContext.Provider>
  );
}

export function useHeaderEditorSlot() {
  const context = useContext(HeaderEditorSlotContext);
  if (!context) throw new Error("useHeaderEditorSlot requires HeaderEditorSlotProvider");
  return context;
}
