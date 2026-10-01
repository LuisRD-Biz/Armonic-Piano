import { Play, Square, RotateCcw, Undo2, Save, FolderOpen, ArrowRight } from 'lucide-react';
import { chordName, type Chord } from '../musicTheory/chords';
import { harmonicFunction } from '../musicTheory/harmonicFunctions';
import { pretty } from '../musicTheory/notes';
import { cadenceLabel, presets } from '../musicTheory/progressionEngine';
interface Props {
  route: Chord[];
  keyName: string;
  playing: boolean;
  playIndex: number;
  onPlay: () => void;
  onUndo: () => void;
  onReset: () => void;
  onSave: () => void;
  onLibrary: () => void;
  onPreset: (index: number) => void;
  onStep: (index: number) => void;
}
export function Progression({
  route,
  keyName,
  playing,
  playIndex,
  onPlay,
  onUndo,
  onReset,
  onSave,
  onLibrary,
  onPreset,
  onStep,
}: Props) {
  const cadence = cadenceLabel(route, keyName);
  return (
    <section className="panel progression-panel">
      <div className="panel-heading">
        <div className="route-heading">
          <span className="eyebrow">03 / TU RECORRIDO</span>
          <h2>Ruta armónica</h2>
          {cadence && <span className="cadence">✓ {cadence}</span>}
        </div>
        <div className="route-actions">
          <select
            aria-label="Progresiones sugeridas"
            value=""
            onChange={(e) => onPreset(Number(e.target.value))}
          >
            <option value="" disabled>
              Progresiones sugeridas
            </option>
            {presets.map((p, i) => (
              <option key={p.name} value={i}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            className="icon-button"
            title="Atrás / deshacer último acorde"
            aria-label="Deshacer"
            onClick={onUndo}
            disabled={route.length < 2}
          >
            <Undo2 size={17} />
          </button>
          <button
            className="icon-button"
            title="Reiniciar ruta"
            aria-label="Reiniciar ruta"
            onClick={onReset}
          >
            <RotateCcw size={17} />
          </button>
          <button
            className="icon-button"
            title="Progresiones guardadas"
            aria-label="Progresiones guardadas"
            onClick={onLibrary}
          >
            <FolderOpen size={17} />
          </button>
        </div>
      </div>
      <div className="route-bottom">
        <div className="route-scroll">
          {route.length === 0 && (
            <span className="muted">Selecciona cualquier acorde para comenzar.</span>
          )}
          {route.map((c, i) => (
            <div className="route-step" key={i}>
              {i > 0 && <ArrowRight className="route-arrow" size={16} />}
              <button
                className={`route-chord ${harmonicFunction(c.degree)} ${i === route.length - 1 ? 'last' : ''} ${playIndex === i ? 'sounding' : ''}`}
                onClick={() => onStep(i)}
                title="Volver a este punto de la ruta"
              >
                <strong>{pretty(chordName(c))}</strong>
                <span>{c.roman}</span>
              </button>
            </div>
          ))}
        </div>
        <div className="play-actions">
          <button className="small-button" disabled={!route.length} onClick={onSave}>
            <Save size={15} />
            Guardar
          </button>
          <button className="primary-button" disabled={!route.length} onClick={onPlay}>
            {playing ? <Square size={16} /> : <Play size={16} />} {playing ? 'Detener' : 'Repetir'}
          </button>
        </div>
      </div>
    </section>
  );
}
