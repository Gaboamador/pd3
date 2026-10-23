import { db } from '../../../firebase.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { customAlphabet } from 'nanoid';
import {
  SHORT_LINK_ID_LENGTH,
  SHORT_LINK_SCHEMA_VERSION,
  createPublicBuildSnapshot,
  isValidPublicBuildSnapshot,
  isValidShortBuildId,
  stableBuildString,
  toBuildSlug,
} from './shortBuildLinks.utils.js';

const makeId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', SHORT_LINK_ID_LENGTH);
const STORAGE_PREFIX = 'pd3_short_build_links_v1_';
const MAX_CACHED_LINKS = 100;
const inFlight = new Map();

function getStorageKey(uid) { return `${STORAGE_PREFIX}${uid}`; }

function readCache(uid) {
  try {
    const value = JSON.parse(localStorage.getItem(getStorageKey(uid)) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

function storeCache(uid, digest, shortId) {
  try {
    const old = readCache(uid);
    delete old[digest];
    const next = { ...old, [digest]: shortId };
    const trimmed = Object.fromEntries(Object.entries(next).slice(-MAX_CACHED_LINKS));
    localStorage.setItem(getStorageKey(uid), JSON.stringify(trimmed));
  } catch { /* El caché es opcional (navegación privada / cuota agotada). */ }
}

async function contentDigest(snapshot) {
  if (!globalThis.crypto?.subtle) return null;
  const data = new TextEncoder().encode(stableBuildString(snapshot));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Registra un snapshot inmutable. Nunca guarda la build en la biblioteca.
 * La regla Firestore allow create (sin update) impide sobrescribir IDs existentes.
 */
export async function createShortBuildLink(uid, build) {
  if (!uid) throw new Error('AUTH_REQUIRED');
  if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('OFFLINE');
  const snapshot = createPublicBuildSnapshot(build);
  if (!isValidPublicBuildSnapshot(snapshot)) throw new Error('INVALID_BUILD');

  const digest = await contentDigest(snapshot);
  if (digest) {
    const existing = readCache(uid)[digest];
    if (isValidShortBuildId(existing)) return existing;
    const key = `${uid}:${digest}`;
    if (inFlight.has(key)) return inFlight.get(key);
    const task = createAndCache(uid, snapshot, digest);
    inFlight.set(key, task);
    try { return await task; } finally { inFlight.delete(key); }
  }
  return createAndCache(uid, snapshot, null);
}

async function createAndCache(uid, snapshot, digest) {
  const shortId = `${toBuildSlug(snapshot.name)}-${makeId()}`;
  // El ID tiene 12 caracteres aleatorios y las rules solo admiten create.
  // Una colisión excepcional falla sin sobrescribir un snapshot existente.
  await setDoc(doc(db, 'sharedBuilds', shortId), {
    schemaVersion: SHORT_LINK_SCHEMA_VERSION,
    ownerUid: uid,
    createdAt: serverTimestamp(),
    build: snapshot,
  });
  if (digest) storeCache(uid, digest, shortId);
  return shortId;
}

/** Lectura pública por ID exacto; NO consulta/lista la colección. */
export async function getShortBuild(shortId) {
  if (!isValidShortBuildId(shortId)) throw new Error('INVALID_SHORT_LINK');
  const result = await getDoc(doc(db, 'sharedBuilds', shortId));
  if (!result.exists()) throw new Error('SHORT_LINK_NOT_FOUND');
  const data = result.data();
  if (data?.schemaVersion !== SHORT_LINK_SCHEMA_VERSION || !isValidPublicBuildSnapshot(data.build)) {
    throw new Error('INVALID_SHORT_LINK');
  }
  return data.build;
}
