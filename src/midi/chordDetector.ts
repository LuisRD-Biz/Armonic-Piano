import { diatonicChords, makeChord, sameChord, type Chord } from '../musicTheory/chords';
import { qualities, type Quality } from '../musicTheory/intervals';
import { mod, noteName } from '../musicTheory/notes';
export interface DetectedChord {
  chord: Chord;
  bass: number;
  inversion: number;
  alternatives: Chord[];
}
export function detectChord(midiNotes: number[], key = 'C'): DetectedChord | null {
  const notes = [...new Set(midiNotes.map((n) => mod(n)))];
  if (notes.length < 3 || notes.length > 4) return null;
  const bass = Math.min(...midiNotes);
  const diatonic = [...diatonicChords(key), ...diatonicChords(key, true)];
  const candidates: Chord[] = [];
  for (const root of notes)
    for (const quality of Object.keys(qualities) as Quality[]) {
      const intervals = qualities[quality].intervals;
      if (
        intervals.length !== notes.length ||
        !intervals.every((i) => notes.includes(mod(root + i)))
      )
        continue;
      const known = diatonic.find((c) => c.root === root && c.quality === quality);
      candidates.push(
        known ?? makeChord(noteName(root, key.includes('b') || key === 'F'), quality),
      );
    }
  candidates.sort((a, b) => {
    const score = (c: Chord) => (c.degree !== undefined ? 4 : 0) + (c.root === mod(bass) ? 2 : 0);
    return score(b) - score(a) || a.root - b.root;
  });
  if (!candidates.length) return null;
  const chord = candidates[0];
  return {
    chord,
    bass,
    inversion: chord.pcs.indexOf(mod(bass)),
    alternatives: candidates.slice(1).filter((c) => !sameChord(c, chord)),
  };
}
