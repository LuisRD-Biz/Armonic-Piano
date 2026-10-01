import { describe, expect, it } from 'vitest';
import { chordName, diatonicChords, makeChord, voice } from './chords';
import { scaleNotes } from './scales';
import { allKeys } from './keys';
import { pitch } from './notes';
import { qualities, type Quality } from './intervals';
import { presetChords, practiceTargets } from './progressionEngine';
import { closestVoicing } from './voiceLeading';
import { detectChord } from '../midi/chordDetector';
import { parseMidi } from '../midi/midiParser';
import { relatedDegrees, relation } from './chordRelations';
describe('Escalas y transposición', () => {
  it.each([
    ['C', 'C Dm Em F G Am Bdim'],
    ['G', 'G Am Bm C D Em F#dim'],
  ])('%s mayor', (key, expected) =>
    expect(diatonicChords(key).map(chordName).join(' ')).toBe(expected),
  );
  it('A menor natural', () =>
    expect(diatonicChords('A', false, 'minor').map(chordName).join(' ')).toBe(
      'Am Bdim C Dm Em F G',
    ));
  it('séptimas de C', () =>
    expect(diatonicChords('C', true).map(chordName).join(' ')).toBe(
      'Cmaj7 Dm7 Em7 Fmaj7 G7 Am7 Bm7b5',
    ));
  it.each([
    ['C', 'C G Am F'],
    ['D', 'D A Bm G'],
    ['G', 'G D Em C'],
  ])('pop en %s', (key, expected) =>
    expect(presetChords(0, key).map(chordName).join(' ')).toBe(expected),
  );
  it.each([
    ['F#', 'F# G# A# B C# D# E#'],
    ['Gb', 'Gb Ab Bb Cb Db Eb F'],
    ['C#', 'C# D# E# F# G# A# B#'],
    ['Db', 'Db Eb F Gb Ab Bb C'],
  ])('ortografía en %s', (key, expected) => expect(scaleNotes(key).join(' ')).toBe(expected));
  it.each(allKeys)('conserva notas diatónicas en %s', (key) => {
    const scale = scaleNotes(key);
    for (const seventh of [false, true])
      for (const chord of diatonicChords(key, seventh)) {
        expect(chord.notes.every((n) => scale.includes(n))).toBe(true);
        expect(chord.notes.map(pitch)).toEqual(chord.pcs);
      }
  });
  it('blues usa dominantes reales', () =>
    expect(presetChords(6, 'C').map(chordName).join(' ')).toBe('C7 F7 C7 G7 F7 C7'));
});
describe('Detector', () => {
  it.each([
    [[60, 64, 67], 'C', 0],
    [[64, 67, 72], 'C', 1],
    [[57, 60, 64], 'Am', 0],
    [[55, 59, 62, 65], 'G7', 0],
    [[62, 65, 69, 72], 'Dm7', 0],
  ] as const)('reconoce %j', (notes, name, inversion) => {
    const d = detectChord([...notes]);
    expect(d && chordName(d.chord)).toBe(name);
    expect(d?.inversion).toBe(inversion);
  });
  it.each(Object.keys(qualities) as Quality[])(
    'reconoce %s en todas las raíces e inversiones',
    (quality) => {
      for (let root = 0; root < 12; root++) {
        const c = makeChord(
          ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root],
          quality,
        );
        for (let inv = 0; inv < c.pcs.length; inv++) {
          const d = detectChord(voice(c, inv))!;
          expect(
            [d.chord, ...d.alternatives].some((x) => x.root === root && x.quality === quality),
          ).toBe(true);
        }
      }
    },
  );
  it('tolera duplicados de octava', () =>
    expect(chordName(detectChord([48, 60, 64, 67, 72])!.chord)).toBe('C'));
  it('rechaza conjuntos incompletos o desconocidos', () => {
    expect(detectChord([60, 64])).toBeNull();
    expect(detectChord([60, 61, 62])).toBeNull();
  });
});
describe('MIDI y conducción', () => {
  it('velocidad cero equivale a soltar', () =>
    expect(parseMidi([0x95, 60, 0])).toEqual({ type: 'off', note: 60, velocity: 0, channel: 5 }));
  it('lee Note On y Note Off', () => {
    expect(parseMidi([0x90, 60, 100])?.type).toBe('on');
    expect(parseMidi([0x80, 60, 64])?.type).toBe('off');
    expect(parseMidi([0xb0, 64, 127])).toBeNull();
  });
  it('propone Am/C cerca de C', () => {
    const best = closestVoicing([60, 64, 67], makeChord('A', 'minor'));
    expect(best.notes).toEqual([60, 64, 69]);
    expect(best.inversion).toBe(1);
  });
  it('relaciones funcionales no conectan todo', () => {
    expect(relatedDegrees(1)).toEqual([4, 6]);
    expect(relation(diatonicChords('D')[4], diatonicChords('D')[0]).strength).toBe('Fuerte');
  });
  it('práctica tiene inversiones y séptimas', () => {
    expect(practiceTargets('C', 2).some((t) => t.inversion === 1)).toBe(true);
    expect(practiceTargets('C', 3).every((t) => t.chord.pcs.length === 4)).toBe(true);
    expect(practiceTargets('C', 4).length).toBeGreaterThan(4);
  });
});
