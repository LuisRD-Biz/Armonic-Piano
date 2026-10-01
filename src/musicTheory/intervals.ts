export const qualities = {
  major: { suffix: '', label: 'Mayor', intervals: [0, 4, 7], formula: ['1', '3', '5'] },
  minor: { suffix: 'm', label: 'Menor', intervals: [0, 3, 7], formula: ['1', '♭3', '5'] },
  diminished: {
    suffix: 'dim',
    label: 'Disminuido',
    intervals: [0, 3, 6],
    formula: ['1', '♭3', '♭5'],
  },
  augmented: { suffix: 'aug', label: 'Aumentado', intervals: [0, 4, 8], formula: ['1', '3', '♯5'] },
  sus2: { suffix: 'sus2', label: 'Suspendido 2', intervals: [0, 2, 7], formula: ['1', '2', '5'] },
  sus4: { suffix: 'sus4', label: 'Suspendido 4', intervals: [0, 5, 7], formula: ['1', '4', '5'] },
  maj7: {
    suffix: 'maj7',
    label: 'Mayor séptima',
    intervals: [0, 4, 7, 11],
    formula: ['1', '3', '5', '7'],
  },
  min7: {
    suffix: 'm7',
    label: 'Menor séptima',
    intervals: [0, 3, 7, 10],
    formula: ['1', '♭3', '5', '♭7'],
  },
  dom7: {
    suffix: '7',
    label: 'Séptima dominante',
    intervals: [0, 4, 7, 10],
    formula: ['1', '3', '5', '♭7'],
  },
  halfDim7: {
    suffix: 'm7b5',
    label: 'Semidisminuido',
    intervals: [0, 3, 6, 10],
    formula: ['1', '♭3', '♭5', '♭7'],
  },
  dim7: {
    suffix: 'dim7',
    label: 'Séptima disminuida',
    intervals: [0, 3, 6, 9],
    formula: ['1', '♭3', '♭5', '𝄫7'],
  },
} as const;
export type Quality = keyof typeof qualities;
