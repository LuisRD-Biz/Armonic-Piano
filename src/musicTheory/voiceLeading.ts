import { voice, type Chord } from './chords';
export function closestVoicing(
  from: number[],
  target: Chord,
): { notes: number[]; inversion: number; distance: number } {
  let best = { notes: voice(target), inversion: 0, distance: Infinity };
  for (let octave = 2; octave <= 5; octave++)
    for (let inversion = 0; inversion < target.pcs.length; inversion++) {
      const notes = voice(target, inversion, octave);
      const distance = notes.reduce(
        (sum, n, i) => sum + Math.abs(n - from[Math.min(i, from.length - 1)]),
        0,
      );
      if (distance < best.distance) best = { notes, inversion, distance };
    }
  return best;
}
