export const mod = (n: number, base = 12) => ((n % base) + base) % base;
const naturals: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export function pitch(name: string): number {
  return mod(
    naturals[name[0]] +
      [...name.slice(1)].reduce((sum, a) => sum + (a === '#' ? 1 : a === 'b' ? -1 : 0), 0),
  );
}
export function spell(pc: number, letter: string): string {
  const delta = mod(pc - naturals[letter] + 6) - 6;
  return letter + (delta > 0 ? '#'.repeat(delta) : 'b'.repeat(-delta));
}
export const noteName = (midi: number, flats = false) =>
  (flats ? flatNames : sharpNames)[mod(midi)];
export const pretty = (name: string) => name.replaceAll('#', '♯').replaceAll('b', '♭');
