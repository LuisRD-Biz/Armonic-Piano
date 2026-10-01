import { useEffect, useState } from 'react';
import { Keyboard, LockKeyhole, UnlockKeyhole } from 'lucide-react';
import { noteName, pretty } from '../musicTheory/notes';
const blackPcs = [1, 3, 6, 8, 10];
const mappings: Record<string, number> = {
  a: 60,
  w: 61,
  s: 62,
  e: 63,
  d: 64,
  f: 65,
  t: 66,
  g: 67,
  y: 68,
  h: 69,
  u: 70,
  j: 71,
  k: 72,
  o: 73,
  l: 74,
  p: 75,
  ';': 76,
};
interface Props {
  selected: number[];
  held: number[];
  onDown: (note: number) => void;
  onUp: (note: number) => void;
  onRelease: () => void;
  velocity: number;
  flats: boolean;
}
export function Piano({ selected, held, onDown, onUp, onRelease, velocity, flats }: Props) {
  const [latch, setLatch] = useState(false);
  useEffect(() => {
    const pressed = new Set<number>();
    const down = (e: KeyboardEvent) => {
      if (
        (e.target instanceof HTMLElement &&
          (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) ||
            e.target.isContentEditable)) ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      const note = mappings[e.key.toLowerCase()];
      if (note !== undefined && !e.repeat) {
        e.preventDefault();
        pressed.add(note);
        onDown(note);
      }
    };
    const up = (e: KeyboardEvent) => {
      const note = mappings[e.key.toLowerCase()];
      if (note !== undefined && pressed.has(note)) {
        pressed.delete(note);
        onUp(note);
      }
    };
    const blur = () => {
      pressed.forEach(onUp);
      pressed.clear();
      onRelease();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      pressed.forEach(onUp);
    };
  }, [onDown, onUp, onRelease]);
  const notes = Array.from({ length: 37 }, (_, i) => 48 + i),
    white = notes.filter((n) => !blackPcs.includes(n % 12));
  return (
    <section className="panel piano-panel">
      <div className="panel-heading">
        <div className="piano-title">
          <Keyboard size={20} />
          <h2>
            Tu piano, tu laboratorio<span className="sr-only"> de piano</span>
          </h2>
        </div>
        <div className="piano-tools">
          <span className="small-label">Velocidad {velocity || '—'}</span>
          <button
            className={latch ? 'small-button active' : 'small-button'}
            onClick={() => {
              setLatch(!latch);
              onRelease();
            }}
            title="Retén notas al hacer clic para formar acordes"
          >
            {latch ? <LockKeyhole size={14} /> : <UnlockKeyhole size={14} />}Retener notas
          </button>
          <button className="small-button" onClick={onRelease}>
            Soltar
          </button>
        </div>
      </div>
      <div className="keyboard-scroll">
        <div className="piano-keys">
          {notes.map((note) => {
            const black = blackPcs.includes(note % 12);
            const before = white.filter((n) => n < note).length;
            const selectedNote = selected.includes(note),
              down = held.includes(note);
            return (
              <button
                key={note}
                aria-label={`${noteName(note, flats)}${Math.floor(note / 12) - 1}`}
                aria-pressed={down}
                className={`piano-key ${black ? 'black' : 'white'} ${selectedNote ? 'highlight' : ''} ${down ? 'pressed' : ''}`}
                style={{
                  left: `${((black ? before - 0.32 : before) / white.length) * 100}%`,
                  width: `${((black ? 0.64 : 1) / white.length) * 100}%`,
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  if (latch && down) onUp(note);
                  else onDown(note);
                }}
                onPointerUp={() => {
                  if (!latch) onUp(note);
                }}
                onPointerCancel={() => onUp(note)}
                onLostPointerCapture={() => {
                  if (!latch) onUp(note);
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                    e.preventDefault();
                    onDown(note);
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onUp(note);
                  }
                }}
              >
                <span>
                  {pretty(noteName(note, flats))}
                  {!black && note % 12 === 0 ? <sub>{Math.floor(note / 12) - 1}</sub> : null}
                </span>
                {down && <i />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="keyboard-footer">
        <span>
          <i className="key-indicator" />
          Acorde seleccionado <i className="key-indicator played" />
          Notas que tocas
        </span>
        <span>Teclado: A W S E D F… · 3 octavas · C3–C6</span>
      </div>
    </section>
  );
}
