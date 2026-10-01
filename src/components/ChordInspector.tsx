import { AudioLines, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { chordName, type Chord } from '../musicTheory/chords';
import { qualities } from '../musicTheory/intervals';
import { functionLabels, harmonicFunction } from '../musicTheory/harmonicFunctions';
import { sharedNotes, relation } from '../musicTheory/chordRelations';
import { noteName, pretty } from '../musicTheory/notes';
import type { DetectedChord } from '../midi/chordDetector';
interface Props {
  current: Chord;
  previous?: Chord;
  target: Chord;
  keyName: string;
  inversion: number;
  onInversion: (n: number) => void;
  onPlay: () => void;
  detected: DetectedChord | null;
  suggestion: { notes: number[]; inversion: number };
  onVoicing: () => void;
}
export function ChordInspector({
  current,
  previous,
  target,
  keyName,
  inversion,
  onInversion,
  onPlay,
  detected,
  suggestion,
  onVoicing,
}: Props) {
  const info = qualities[current.quality],
    fn = harmonicFunction(current.degree),
    rotated = [...current.notes.slice(inversion), ...current.notes.slice(0, inversion)];
  return (
    <aside className="panel inspector">
      <span className="eyebrow">EL ACORDE, POR DENTRO</span>
      <div className="inspector-chord">
        <h2>
          {pretty(chordName(current))}
          {inversion > 0 && <small>/{pretty(current.notes[inversion])}</small>}
        </h2>
        <button className="icon-button" onClick={onPlay} aria-label="Escuchar acorde">
          <AudioLines size={21} />
        </button>
      </div>
      <p className="muted">{info.label}</p>
      <span className={`function-badge ${fn}`}>
        {current.roman} · {functionLabels[fn]}
      </span>
      <div className="inspector-section chord-notes">
        <label>NOTAS</label>
        <div className="note-chips">
          {rotated.map((n) => (
            <span key={n}>{pretty(n)}</span>
          ))}
        </div>
        <div className="formula">{info.formula.join(' — ')}</div>
      </div>
      <div className="inversion-control">
        <button
          className="icon-button"
          onClick={() => onInversion((inversion - 1 + current.pcs.length) % current.pcs.length)}
          aria-label="Inversión anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span>{inversion === 0 ? 'Posición fundamental' : `${inversion}.ª inversión`}</span>
        <button
          className="icon-button"
          onClick={() => onInversion((inversion + 1) % current.pcs.length)}
          aria-label="Inversión siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="inspector-section movement-info">
        <label>{previous ? 'ÚLTIMO MOVIMIENTO' : 'EN ESTA TONALIDAD'}</label>
        <p>
          {previous
            ? relation(previous, current).explanation
            : `${current.roman} de ${pretty(keyName)} mayor. ${functionLabels[fn]}${fn === 'tonic' ? ': un lugar de reposo.' : fn === 'dominant' ? ': tensión hacia la tónica.' : ': prepara el siguiente movimiento.'}`}
        </p>
        {previous && (
          <p className="muted">
            Notas compartidas: {sharedNotes(previous, current).map(pretty).join(', ') || 'ninguna'}
          </p>
        )}
      </div>
      <div className="voice-card">
        <Sparkles size={16} />
        <div>
          <strong>Prueba {pretty(chordName(target))}</strong>
          <p>
            {suggestion.notes
              .map((n) => pretty(noteName(n, keyName.includes('b') || keyName === 'F')))
              .join(' · ')}
          </p>
          <span>Inversión cercana para mover menos las manos.</span>
          <button className="text-button" onClick={onVoicing}>
            Escuchar y continuar
          </button>
        </div>
      </div>
      {detected && (
        <div className="detected-card" aria-live="polite">
          <label>ACORDE DETECTADO</label>
          <strong>
            {pretty(chordName(detected.chord))}
            {detected.inversion > 0 ? `/${pretty(detected.chord.notes[detected.inversion])}` : ''}
          </strong>
          <span>
            {qualities[detected.chord.quality].label} ·{' '}
            {detected.inversion ? `${detected.inversion}.ª inversión` : 'Fundamental'}
          </span>
          {detected.alternatives.length > 0 && (
            <span>
              También: {detected.alternatives.map((c) => pretty(chordName(c))).join(', ')}
            </span>
          )}
        </div>
      )}
    </aside>
  );
}
