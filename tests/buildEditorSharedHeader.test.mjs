import assert from 'node:assert/strict';
import test from 'node:test';
import { isBuildEditorRoute } from '../src/utils/isBuildEditorRoute.js';

test('el Header móvil reconoce editor, enlaces largos y enlaces cortos', () => {
  for (const pathname of [
    '/build-editor',
    '/build-editor/b/abc',
    '/build-editor/share/abc',
    '/s/abc',
    '/q/shadow-siphon-vampire-alternative-74eqodohxfy8',
  ]) {
    assert.equal(isBuildEditorRoute(pathname), true, pathname);
  }
});

test('no monta controles del editor en otras rutas ni en prefijos parecidos', () => {
  for (const pathname of [
    '/', '/library-explorer', '/challenge-mode', '/catalog',
    '/build-editor-backup', '/short-link', '/q', '/s',
    '/query/example', '/shared/abc',
  ]) {
    assert.equal(isBuildEditorRoute(pathname), false, pathname);
  }
});
