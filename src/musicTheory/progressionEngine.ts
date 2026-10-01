import { diatonicChords, makeChord, type Chord } from './chords';
export const presets = [
  { name: 'Pop · cuatro acordes', degrees: [0, 4, 5, 3] },
  { name: 'Pop · años 50', degrees: [0, 5, 3, 4] },
  { name: 'Pop · desde vi', degrees: [5, 3, 0, 4] },
  { name: 'Clásica · cadencia', degrees: [0, 3, 4, 0] },
  { name: 'Clásica · ii–V–I', degrees: [1, 4, 0] },
  { name: 'Jazz · ii–V–I', degrees: [1, 4, 0], seventh: true },
  { name: 'Blues · vuelta de seis', degrees: [0, 3, 0, 4, 3, 0], blues: true },
  { name: 'Canon', degrees: [0, 4, 5, 2, 3, 0, 3, 4] },
];
export function presetChords(index: number, key: string, seventh = false): Chord[] {
  const preset = presets[index];
  const chords = diatonicChords(key, preset.seventh || seventh);
  return preset.degrees.map((d) =>
    preset.blues
      ? makeChord(chords[d].rootName, 'dom7', undefined, ['I7', '', '', 'IV7', 'V7'][d])
      : chords[d],
  );
}
export interface PracticeTarget {
  chord: Chord;
  inversion: number | null;
}
export function practiceTargets(key: string, level: number, variant = 0): PracticeTarget[] {
  const choices = level === 4 ? [7, 6] : level === 3 ? [5, 0] : [1, 3, 0, 2];
  return presetChords(choices[variant % choices.length], key, level >= 3).map((chord, i) => ({
    chord,
    inversion: level === 1 ? 0 : level === 2 ? (i + variant) % 3 : null,
  }));
}
export function cadenceLabel(route: Chord[], key: string): string | null {
  const degrees = route
    .slice(-3)
    .map((c) => c.degree)
    .join(',');
  return degrees === '1,4,0'
    ? `ii–V–I en ${key} mayor`
    : degrees === '3,4,0'
      ? `Cadencia IV–V–I en ${key} mayor`
      : null;
}
