// La ruta determina el grupo predeterminado; un cambio manual prevalece
// únicamente mientras el usuario permanezca en esa misma ruta.
const TOOL_ROUTES = ['/library-roulette', '/randomizer', '/challenge-mode'];

export function isToolRoute(pathname) {
  return TOOL_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

export function getMobileNavGroup(pathname, override = null) {
  if (override?.pathname === pathname) {
    return override.toolsOpen ? 'tools' : 'main';
  }
  return isToolRoute(pathname) ? 'tools' : 'main';
}
