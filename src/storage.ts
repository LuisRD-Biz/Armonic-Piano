import { qualities } from './musicTheory/intervals';
import type { Chord } from './musicTheory/chords';
export interface SavedProgression {
  id: string;
  name: string;
  key: string;
  chords: Chord[];
}
const storageKey = 'armonia.progressions.v1';
export function loadProgressions(): SavedProgression[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(data)) return [];
    return data.filter(
      (p): p is SavedProgression =>
        p &&
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        typeof p.key === 'string' &&
        Array.isArray(p.chords) &&
        p.chords.length > 0 &&
        p.chords.every(
          (c: Chord) =>
            c &&
            Number.isInteger(c.root) &&
            c.root >= 0 &&
            c.root < 12 &&
            typeof c.rootName === 'string' &&
            /^[A-G][#b]*$/.test(c.rootName) &&
            c.quality in qualities &&
            Array.isArray(c.pcs) &&
            c.pcs.length >= 3 &&
            c.pcs.every((n) => Number.isInteger(n) && n >= 0 && n < 12) &&
            Array.isArray(c.notes) &&
            c.notes.every((n) => typeof n === 'string') &&
            typeof c.roman === 'string' &&
            (c.degree === undefined ||
              (Number.isInteger(c.degree) && c.degree >= 0 && c.degree <= 6)),
        ),
    );
  } catch {
    return [];
  }
}
export function persistProgressions(progressions: SavedProgression[]) {
  localStorage.setItem(storageKey, JSON.stringify(progressions));
}
