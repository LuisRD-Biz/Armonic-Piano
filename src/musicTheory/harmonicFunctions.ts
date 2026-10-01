export type HarmonicFunction = 'tonic' | 'predominant' | 'dominant' | 'chromatic';
export const functionLabels: Record<HarmonicFunction, string> = {
  tonic: 'Tónica',
  predominant: 'Predominante',
  dominant: 'Dominante',
  chromatic: 'Cromático',
};
export function harmonicFunction(degree: number | undefined): HarmonicFunction {
  if (degree === undefined) return 'chromatic';
  return [0, 2, 5].includes(degree)
    ? 'tonic'
    : [1, 3].includes(degree)
      ? 'predominant'
      : 'dominant';
}
