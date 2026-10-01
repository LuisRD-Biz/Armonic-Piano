import { qualities, type Quality } from './intervals';
import { letters, mod, pitch, spell } from './notes';
import { scaleNotes, type ScaleMode } from './scales';
export interface Chord {
  root: number;
  rootName: string;
  quality: Quality;
  notes: string[];
  pcs: number[];
  degree?: number;
  roman: string;
}
export const chordName = (chord: Chord) => chord.rootName + qualities[chord.quality].suffix;
export const sameChord = (a: Chord, b: Chord) => a.root === b.root && a.quality === b.quality;
export function makeChord(rootName: string, quality: Quality, degree?: number, roman = '—'): Chord {
  const root = pitch(rootName);
  const offsets = quality === 'sus2' ? [0, 1, 4] : quality === 'sus4' ? [0, 3, 4] : [0, 2, 4, 6];
  const pcs = qualities[quality].intervals.map((i) => mod(root + i));
  const notes = pcs.map((pc, i) =>
    spell(pc, letters[mod(letters.indexOf(rootName[0]) + offsets[i], 7)]),
  );
  return { root, rootName, quality, pcs, notes, degree, roman };
}
export function diatonicChords(key: string, seventh = false, mode: ScaleMode = 'major'): Chord[] {
  const scale = scaleNotes(key, mode);
  const bases =
    mode === 'major'
      ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii']
      : ['i', 'ii', 'III', 'iv', 'v', 'VI', 'VII'];
  return scale.map((rootName, degree) => {
    const root = pitch(rootName);
    const ints = Array.from({ length: seventh ? 4 : 3 }, (_, j) =>
      mod(pitch(scale[(degree + 2 * j) % 7]) - root),
    );
    const quality = (Object.keys(qualities) as Quality[]).find(
      (q) => qualities[q].intervals.join(',') === ints.join(','),
    )!;
    const suffix =
      quality === 'diminished'
        ? '°'
        : quality === 'halfDim7'
          ? 'ø7'
          : quality === 'maj7'
            ? 'maj7'
            : seventh
              ? '7'
              : '';
    return makeChord(rootName, quality, degree, bases[degree] + suffix);
  });
}
export function voice(chord: Chord, inversion = 0, octave = 4): number[] {
  const notes = qualities[chord.quality].intervals.map((i) => 12 * (octave + 1) + chord.root + i);
  for (let i = 0; i < mod(inversion, notes.length); i++) notes.push(notes.shift()! + 12);
  return notes;
}
