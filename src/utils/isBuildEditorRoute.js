// Ambas rutas compartidas deben montar los controles del editor en el Header móvil.
// Centralizar aquí la detección evita que una nueva URL de Share
// pierda el nombre de la build y las pestañas Loadout / Skills.
export function isBuildEditorRoute(pathname) {
  return pathname === "/build-editor"
    || pathname.startsWith("/build-editor/")
    || pathname.startsWith("/s/")
    || pathname.startsWith("/q/");
}
