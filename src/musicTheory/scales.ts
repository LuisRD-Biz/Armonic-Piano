import { letters, mod, pitch, spell } from './notes';
export type ScaleMode = 'major' | 'minor';
export function scaleNotes(key: string, mode: ScaleMode = 'major'): string[] {
  const steps = mode === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  return steps.map((step, i) =>
    spell(mod(pitch(key) + step), letters[mod(letters.indexOf(key[0]) + i, 7)]),
  );
}
