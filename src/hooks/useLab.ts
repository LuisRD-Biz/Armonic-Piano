import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chordName, diatonicChords, sameChord, voice, type Chord } from '../musicTheory/chords';
import { practiceTargets } from '../musicTheory/progressionEngine';
import { useMidi } from './useMidi';
import { useChordInput } from './useChordInput';
import { synth } from '../audio/synth';
export type ChordMode = 'triads' | 'sevenths' | 'both';
export function useLab() {
  const [keyName, setKeyName] = useState('C'),
    [chordMode, setChordMode] = useState<ChordMode>('triads');
  const [route, setRoute] = useState<Chord[]>([diatonicChords('C')[0]]);
  const [inversion, setInversion] = useState(0),
    [customVoice, setCustomVoice] = useState<number[] | null>(null);
  const [mode, setMode] = useState<'explore' | 'practice'>('explore'),
    [level, setLevel] = useState(1),
    [variant, setVariant] = useState(0),
    [practiceIndex, setPracticeIndex] = useState(0);
  const [virtual, setVirtual] = useState<number[]>([]),
    [playing, setPlaying] = useState(false),
    [playIndex, setPlayIndex] = useState(-1);
  const [feedback, setFeedback] = useState('');
  const midi = useMidi();
  const held = useMemo(
    () => [...new Set([...midi.notes, ...virtual])].sort((a, b) => a - b),
    [midi.notes, virtual],
  );
  const detected = useChordInput(held, keyName);
  const chords = useMemo(
    () => diatonicChords(keyName, chordMode === 'sevenths'),
    [keyName, chordMode],
  );
  const sevenths = useMemo(() => diatonicChords(keyName, true), [keyName]);
  const targets = useMemo(
    () => practiceTargets(keyName, level, variant),
    [keyName, level, variant],
  );
  const current = route[route.length - 1] ?? chords[0];
  const display = playing && playIndex >= 0 ? (route[playIndex] ?? current) : current;
  const selected = customVoice ?? voice(display, inversion);
  const practiceGate = useRef(false),
    lastDetected = useRef('');
  const stop = useCallback(() => {
    synth.stop();
    setPlaying(false);
    setPlayIndex(-1);
  }, []);
  const select = useCallback(
    (chord: Chord, inv = 0, notes?: number[]) => {
      stop();
      setRoute((r) => [...r, chord]);
      setInversion(inv);
      setCustomVoice(notes ?? null);
      void synth.chord(notes ?? voice(chord, inv));
    },
    [stop],
  );
  function changeKey(key: string) {
    stop();
    setKeyName(key);
    setRoute([diatonicChords(key, chordMode === 'sevenths')[0]]);
    setInversion(0);
    setCustomVoice(null);
    setPracticeIndex(0);
    practiceGate.current = held.length > 0;
    setFeedback('');
    void synth.chord(voice(diatonicChords(key, chordMode === 'sevenths')[0]));
  }
  function changeChordMode(value: ChordMode) {
    stop();
    setChordMode(value);
    const replacement = diatonicChords(keyName, value === 'sevenths')[current.degree ?? 0];
    setRoute((r) => [...r.slice(0, -1), replacement]);
    setInversion(0);
    setCustomVoice(null);
  }
  function changeInversion(value: number) {
    stop();
    setInversion(value);
    setCustomVoice(null);
    void synth.chord(voice(current, value));
  }
  function replaceRoute(next: Chord[]) {
    stop();
    setRoute(next);
    setInversion(0);
    setCustomVoice(null);
  }
  const down = useCallback((note: number) => {
    setVirtual((n) => (n.includes(note) ? n : [...n, note]));
    void synth.on(note);
  }, []);
  const up = useCallback((note: number) => {
    setVirtual((n) => n.filter((x) => x !== note));
    synth.off(note);
  }, []);
  const release = useCallback(() => {
    setVirtual([]);
    synth.stop();
    setPlaying(false);
    setPlayIndex(-1);
  }, []);
  const previousMidi = useRef<number[]>([]);
  useEffect(() => {
    midi.notes
      .filter((n) => !previousMidi.current.includes(n))
      .forEach((n) => {
        void synth.on(n, midi.velocity);
      });
    previousMidi.current.filter((n) => !midi.notes.includes(n)).forEach((n) => synth.off(n));
    previousMidi.current = midi.notes;
  }, [midi.notes, midi.velocity]);
  useEffect(() => {
    if (held.length === 0) {
      practiceGate.current = false;
      lastDetected.current = '';
    }
  }, [held]);
  useEffect(() => {
    if (!detected || playing || held.length < 3) return;
    const signature = `${detected.chord.root}:${detected.chord.quality}:${detected.inversion}`;
    if (mode === 'practice') {
      if (practiceGate.current) return;
      const target = targets[practiceIndex];
      if (!target) return;
      if (
        sameChord(target.chord, detected.chord) &&
        (target.inversion === null || target.inversion === detected.inversion)
      ) {
        practiceGate.current = true;
        setPracticeIndex((i) => i + 1);
        setFeedback(`✓ ${chordName(target.chord)}. Suelta las notas para continuar.`);
        setRoute((r) => [...r, detected.chord]);
        setInversion(detected.inversion);
        setCustomVoice(null);
      } else
        setFeedback(
          sameChord(target.chord, detected.chord)
            ? 'El acorde coincide. Prueba la inversión indicada.'
            : `Escuché ${chordName(detected.chord)}. Prueba ${chordName(target.chord)}.`,
        );
    } else if (lastDetected.current !== signature) {
      lastDetected.current = signature;
      setRoute((r) =>
        sameChord(r[r.length - 1] ?? chords[0], detected.chord) ? r : [...r, detected.chord],
      );
      setInversion(detected.inversion);
      setCustomVoice(null);
    }
  }, [detected, mode, targets, practiceIndex, playing, held.length, chords]);
  function startPractice(nextLevel = level) {
    stop();
    setLevel(nextLevel);
    setVariant((v) => v + 1);
    setPracticeIndex(0);
    setFeedback('');
    practiceGate.current = held.length > 0;
    setMode('practice');
  }
  function playRoute() {
    if (playing) {
      stop();
      return;
    }
    setPlaying(true);
    setCustomVoice(null);
    setInversion(0);
    void synth.progression(
      route.map((c) => voice(c)),
      setPlayIndex,
      () => {
        setPlaying(false);
        setPlayIndex(-1);
      },
    );
  }
  useEffect(() => () => synth.stop(), []);
  return {
    keyName,
    chordMode,
    route,
    current: display,
    inversion,
    mode,
    level,
    practiceIndex,
    targets,
    feedback,
    midi,
    held,
    detected,
    chords,
    sevenths,
    selected,
    playing,
    playIndex,
    select,
    changeKey,
    changeChordMode,
    changeInversion,
    replaceRoute,
    down,
    up,
    release,
    startPractice,
    playRoute,
    setMode,
    setFeedback,
  };
}
