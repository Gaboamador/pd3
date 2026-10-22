import assert from 'node:assert/strict';
import test from 'node:test';
import { getMobileNavGroup, isToolRoute } from '../src/components/mobileNavigationState.js';

test('las tres herramientas aleatorias abren el grupo secundario', () => {
  for (const pathname of ['/library-roulette', '/randomizer', '/challenge-mode']) {
    assert.equal(isToolRoute(pathname), true);
    assert.equal(getMobileNavGroup(pathname), 'tools');
  }
});

test('las rutas principales muestran el grupo principal, incluso al entrar desde rutas compartidas', () => {
  for (const pathname of ['/', '/build-editor', '/build-editor/share/abc', '/s/abc', '/library-explorer', '/catalog/weapons/primary', '/compare-builds']) {
    assert.equal(isToolRoute(pathname), false);
    assert.equal(getMobileNavGroup(pathname), 'main');
  }
});

test('el cierre manual sobre una herramienta conserva la ruta actual', () => {
  const override = { pathname: '/challenge-mode', toolsOpen: false };
  assert.equal(getMobileNavGroup('/challenge-mode', override), 'main');
  assert.equal(getMobileNavGroup('/randomizer', override), 'tools');
  assert.equal(getMobileNavGroup('/', override), 'main');
});

test('abrir el menú desde una ruta principal no cambia la selección tras navegar', () => {
  const override = { pathname: '/catalog', toolsOpen: true };
  assert.equal(getMobileNavGroup('/catalog', override), 'tools');
  assert.equal(getMobileNavGroup('/build-editor', override), 'main');
});

test('no confundir prefijos de rutas con herramientas reales', () => {
  assert.equal(isToolRoute('/randomizer-backup'), false);
  assert.equal(isToolRoute('/challenge-mode/preview'), true);
});
