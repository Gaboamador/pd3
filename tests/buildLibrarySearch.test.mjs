import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPreviewParts, formatPlates, getBuildLibraryDetails,
  matchesBuildLibrarySearch, normalizeBuildSearch,
} from '../src/utils/buildPreview.js';

const sample = {
  id: 'sample',
  name: 'Joy (Sentry: AR) "Turret Main"',
  loadout: {
    primary: { weaponKey: 'CAR4' },
    secondary: { weaponKey: 'S40' },
    overkill: 'HET5',
    armor: { key: 'Suit', plates: ['resistant', null, 'resistant'] },
    throwable: 'FragGrenade',
    deployable: 'ArmorBag',
    tool: 'PhoneMicroCamera',
  },
};

test('la búsqueda normaliza tildes, puntuación y mayúsculas', () => {
  assert.equal(normalizeBuildSearch('ÁNGEL (SMG) / Turret'), 'angel smg turret');
  assert.equal(matchesBuildLibrarySearch(sample, 'TURRET joy'), true);
  assert.equal(matchesBuildLibrarySearch(sample, '  '), true);
  assert.equal(matchesBuildLibrarySearch(sample, 'vampire'), false);
});

test('busca palabras presentes en diferentes partes del loadout', () => {
  assert.equal(matchesBuildLibrarySearch(sample, 'CAR-4 armor'), true);
  assert.equal(matchesBuildLibrarySearch(sample, 'red fox micro cam'), true);
  assert.equal(matchesBuildLibrarySearch(sample, 'resistant grenade'), true);
  assert.equal(matchesBuildLibrarySearch(sample, 'AK-47 grenade'), false);
});

test('estructura de detalles, resumen anterior y plates vacías', () => {
  const details = getBuildLibraryDetails(sample);
  assert.equal(details.primary, 'CAR-4');
  assert.equal(details.secondary, 'Signature 40');
  assert.equal(details.deployable, 'Armor Bag');
  assert.equal(details.plates, 'Resistant x2');
  assert.equal(formatPlates([null, null]), null);
  assert.equal(buildPreviewParts(sample).length, 7);
});

test('acepta builds incompletas sin romper la búsqueda ni el render', () => {
  assert.deepEqual(buildPreviewParts({ name: '' }), []);
  assert.equal(matchesBuildLibrarySearch({}, 'anything'), false);
  assert.equal(matchesBuildLibrarySearch({}, ''), true);
});
