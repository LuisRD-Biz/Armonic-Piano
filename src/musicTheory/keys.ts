import { scaleNotes } from './scales';
export const circleKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const allKeys = [...circleKeys, 'Gb', 'C#', 'Cb'];
export const relativeMinor = (key: string) => scaleNotes(key)[5] + 'm';
export const signatures = [
  '0',
  '1 ♯',
  '2 ♯',
  '3 ♯',
  '4 ♯',
  '5 ♯',
  '6 ♯ / 6 ♭',
  '5 ♭',
  '4 ♭',
  '3 ♭',
  '2 ♭',
  '1 ♭',
];
