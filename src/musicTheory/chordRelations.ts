import type { Chord } from './chords';
import { functionLabels, harmonicFunction } from './harmonicFunctions';
export type Strength = 'Fuerte' | 'Natural' | 'Suave' | 'Menos común' | 'Cromático';
const moves: Record<number, number[]> = {
  0: [3, 4, 5, 1, 2],
  1: [4, 6],
  2: [5, 3],
  3: [4, 0, 1],
  4: [0, 5],
  5: [1, 3, 4, 0, 2],
  6: [0, 2],
};
export const relatedDegrees = (degree: number | undefined) =>
  degree === undefined ? [0, 3, 4, 5] : moves[degree];
export const sharedNotes = (a: Chord, b: Chord) =>
  a.notes.filter((_, i) => b.pcs.includes(a.pcs[i]));
export function relation(
  a: Chord,
  b: Chord,
): { strength: Strength; explanation: string; weight: number } {
  const from = harmonicFunction(a.degree),
    to = harmonicFunction(b.degree);
  const shared = sharedNotes(a, b);
  if (from === 'chromatic' || to === 'chromatic')
    return {
      strength: 'Cromático',
      explanation: 'Color fuera de la tonalidad. Escucha cómo cambia la tensión.',
      weight: 1,
    };
  const functions = `${functionLabels[from]} → ${functionLabels[to]}.`;
  if ((from === 'dominant' && b.degree === 0) || (from === 'predominant' && b.degree === 4))
    return {
      strength: 'Fuerte',
      explanation:
        functions + (b.degree === 0 ? ' La tensión encuentra reposo.' : ' Prepara la resolución.'),
      weight: 3,
    };
  if (!relatedDegrees(a.degree).includes(b.degree!))
    return {
      strength: 'Menos común',
      explanation: functions + ' Un giro menos habitual; también puedes explorarlo.',
      weight: 1,
    };
  if (shared.length >= 2)
    return {
      strength: 'Suave',
      explanation: `Comparten ${shared.join(' y ')}. ${b.roman} aporta otro color con poco movimiento.`,
      weight: 1.5,
    };
  return {
    strength: 'Natural',
    explanation:
      functions +
      (a.degree === 4 && b.degree === 5
        ? ' Cadencia rota: prolonga el recorrido.'
        : ' Un movimiento habitual dentro de la tonalidad.'),
    weight: 2,
  };
}
