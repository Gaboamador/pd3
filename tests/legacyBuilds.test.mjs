import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isLegacyBuild,
  filterActiveBuilds,
  filterLegacyBuilds,
  withLegacyStatus,
} from '../src/library/utils/legacyBuilds.js';

const base = {
  id: 'active1',
  name: 'Impact build',
  slot: 0,
  loadout: { primary: { weaponKey: 'CAR4', mods: { Sight: 3 } } },
  skills: { impact: { base: true, aced: false } },
};

test('los builds históricos sin isLegacy siguen siendo activos', () => {
  assert.equal(isLegacyBuild(base), false);
  assert.equal(isLegacyBuild({ ...base, isLegacy: false }), false);
  assert.equal(isLegacyBuild({ ...base, isLegacy: true }), true);
  assert.equal(isLegacyBuild(null), false);
});

test('archivar es reversible, libera slot y conserva loadout y skills', () => {
  const archived = withLegacyStatus(base, true);
  assert.equal(archived.isLegacy, true);
  assert.equal(archived.slot, null);
  assert.deepEqual(archived.loadout, base.loadout);
  assert.deepEqual(archived.skills, base.skills);
  assert.equal(base.slot, 0, 'no mutar el build original');
  assert.equal(base.isLegacy, undefined);

  const restored = withLegacyStatus(archived, false);
  assert.equal(restored.isLegacy, false);
  assert.equal(restored.slot, null, 'no restituir un slot previamente ocupado');
  assert.deepEqual(restored.loadout, base.loadout);
});

test('separación excluye legacy de grupos activos incluso sin slot', () => {
  const activeUnassigned = { id: 'u', name: 'Unassigned', slot: null };
  const archivedWithSlot = { id: 'l', name: 'Old', slot: 3, isLegacy: true };
  const builds = [base, activeUnassigned, archivedWithSlot];
  assert.deepEqual(filterActiveBuilds(builds).map(b => b.id), ['active1', 'u']);
  assert.deepEqual(filterLegacyBuilds(builds).map(b => b.id), ['l']);
  assert.deepEqual(filterActiveBuilds([]), []);
  assert.deepEqual(filterLegacyBuilds(undefined), []);
});

test('el toggle de Explorer añade legacy sin excluir los activos', () => {
  const archived = withLegacyStatus({ ...base, id: 'old' }, true);
  const library = [base, archived];
  assert.deepEqual(filterActiveBuilds(library).map(b => b.id), ['active1']);
  assert.deepEqual(library.map(b => b.id), ['active1', 'old']);
  // La ruleta usa filterActiveBuilds independientemente del toggle de Explorer.
  assert.equal(filterActiveBuilds(library).some(b => b.id === archived.id), false);
});
