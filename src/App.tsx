import { useState } from 'react';
import {
  AudioLines,
  Cable,
  Compass,
  GraduationCap,
  Volume2,
  CircleHelp,
  Check,
  Piano as PianoIcon,
} from 'lucide-react';
import { useLab, type ChordMode } from './hooks/useLab';
import { allKeys } from './musicTheory/keys';
import { chordName, type Chord } from './musicTheory/chords';
import { relatedDegrees } from './musicTheory/chordRelations';
import { harmonicFunction, functionLabels } from './musicTheory/harmonicFunctions';
import { closestVoicing } from './musicTheory/voiceLeading';
import { pretty } from './musicTheory/notes';
import { presetChords } from './musicTheory/progressionEngine';
import { synth } from './audio/synth';
import { loadProgressions, persistProgressions, type SavedProgression } from './storage';
import { CircleOfFifths } from './components/CircleOfFifths';
import { HarmonicMap } from './components/HarmonicMap';
import { ChordInspector } from './components/ChordInspector';
import { Piano } from './components/Piano';
import { Progression } from './components/Progression';
import { Library } from './components/Library';
export default function App() {
  const lab = useLab();
  const [saved, setSaved] = useState(loadProgressions),
    [dialog, setDialog] = useState<'save' | 'library' | null>(null),
    [notice, setNotice] = useState(''),
    [help, setHelp] = useState(false),
    [volume, setVolume] = useState(45);
  const target = lab.chords[relatedDegrees(lab.current.degree)[0]],
    suggestion = closestVoicing(lab.selected, target);
  const practice = lab.targets[lab.practiceIndex];
  function save(name: string) {
    const next = [...saved, { id: crypto.randomUUID(), name, key: lab.keyName, chords: lab.route }];
    try {
      persistProgressions(next);
      setSaved(next);
      setDialog(null);
      setNotice('Progresión guardada en este navegador.');
    } catch {
      setNotice('No se pudo guardar. Comprueba el almacenamiento del navegador.');
    }
  }
  function load(p: SavedProgression) {
    lab.changeKey(p.key);
    lab.replaceRoute(p.chords);
    setDialog(null);
    setNotice(`Cargada: ${p.name}`);
  }
  function remove(id: string) {
    const next = saved.filter((p) => p.id !== id);
    try {
      persistProgressions(next);
      setSaved(next);
    } catch {
      setNotice('No se pudo actualizar el almacenamiento.');
    }
  }
  const chordButton = (c: Chord) => (
    <button
      key={chordName(c)}
      className={`diatonic-chord ${harmonicFunction(c.degree)} ${c.root === lab.current.root && c.quality === lab.current.quality ? 'selected' : ''}`}
      onClick={() => lab.select(c)}
    >
      <span>{c.roman}</span>
      <strong>{pretty(chordName(c))}</strong>
      <small>{functionLabels[harmonicFunction(c.degree)]}</small>
    </button>
  );
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#">
          <span className="brand-mark">
            <AudioLines size={25} />
          </span>
          <span>
            armonía<span className="brand-dot">.</span>
            <small>LABORATORIO MUSICAL</small>
          </span>
        </a>
        <nav className="mode-tabs" aria-label="Modo">
          <button
            className={lab.mode === 'explore' ? 'active' : ''}
            onClick={() => lab.setMode('explore')}
          >
            <Compass size={17} />
            Explorar
          </button>
          <button
            className={lab.mode === 'practice' ? 'active' : ''}
            onClick={() => lab.startPractice()}
          >
            <GraduationCap size={18} />
            Práctica
          </button>
        </nav>
        <button className="help-button" onClick={() => setHelp(!help)} aria-expanded={help}>
          <CircleHelp size={18} />
          <span>Cómo funciona</span>
        </button>
      </header>
      <main>
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">ESCUCHA. CONECTA. DESCUBRE.</span>
            <h1>
              La armonía está en tus manos<span>.</span>
            </h1>
            <p>Toca un acorde. Descubre sus conexiones. Encuentra tu propio camino.</p>
          </div>
          <div className="session-tag">
            <PianoIcon size={19} />
            <span>
              Tu espacio para explorar<small>Sin una única respuesta correcta</small>
            </span>
          </div>
        </div>
        {help && (
          <div className="help-panel">
            <strong>Empieza con un acorde.</strong>
            <p>
              Elige una tonalidad y pulsa cualquier acorde. El mapa sugiere destinos; cada selección
              amplía tu ruta. Conecta tu teclado USB y pulsa «Conectar MIDI». También puedes tocar
              con A W S E D F… o activar «Retener notas» para formar acordes con clics. En Práctica,
              toca el acorde pedido y suelta todas las notas antes del siguiente.
            </p>
            <p>
              Las líneas gruesas indican movimientos fuertes; las discontinuas, notas compartidas.
              El círculo cambia de tonalidad; el mapa construye progresiones dentro de ella. Audio
              sintetizado, sin muestras de piano.
            </p>
          </div>
        )}
        <section className="toolbar" aria-label="Configuración musical">
          <div className="tonality-control">
            <label htmlFor="key">Tonalidad</label>
            <select id="key" value={lab.keyName} onChange={(e) => lab.changeKey(e.target.value)}>
              {allKeys.map((k) => (
                <option key={k} value={k}>
                  {pretty(k)} mayor
                </option>
              ))}
            </select>
          </div>
          <div className="toolbar-divider" />
          <div className="segmented" aria-label="Tipo de acordes">
            {(
              [
                ['triads', 'Tríadas'],
                ['sevenths', 'Séptimas'],
                ['both', 'Ambos'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                aria-pressed={lab.chordMode === value}
                className={lab.chordMode === value ? 'active' : ''}
                onClick={() => lab.changeChordMode(value as ChordMode)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="midi-control">
            <Cable size={18} />
            {lab.midi.devices.length > 0 ? (
              <select
                aria-label="Entrada MIDI"
                value={lab.midi.selectedId}
                onChange={(e) => lab.midi.select(e.target.value)}
              >
                {lab.midi.devices.map((d) => (
                  <option value={d.id} key={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="midi-status" role="status">
                {lab.midi.status}
              </span>
            )}
            <button
              className={`small-button ${lab.midi.status === 'MIDI conectado' ? 'connected' : ''}`}
              onClick={() => void lab.midi.connect()}
            >
              {lab.midi.status === 'MIDI conectado' ? (
                <>
                  <Check size={14} />
                  Conectado
                </>
              ) : (
                'Conectar MIDI'
              )}
            </button>
          </div>
        </section>
        {[
          'MIDI no compatible',
          'Permiso MIDI rechazado',
          'Error de conexión MIDI',
          'No hay dispositivos',
        ].includes(lab.midi.status) && (
          <p className="notice" role="status">
            {lab.midi.status}.{' '}
            {lab.midi.status === 'MIDI no compatible'
              ? 'Abre la aplicación en un navegador con Web MIDI, como Chrome o Edge, desde localhost o HTTPS.'
              : lab.midi.status === 'Permiso MIDI rechazado'
                ? 'Habilita MIDI en los permisos del sitio y vuelve a conectar.'
                : 'Comprueba el cable USB y vuelve a conectar.'}{' '}
            Puedes seguir usando el piano virtual.
          </p>
        )}
        {lab.mode === 'practice' && (
          <section className="practice-panel">
            <div>
              <span className="eyebrow">ENTRENA EL OÍDO Y LAS MANOS</span>
              <h2>
                {practice
                  ? `Toca ${pretty(chordName(practice.chord))}${practice.inversion ? ` / ${pretty(practice.chord.notes[practice.inversion])}` : ''}`
                  : '¡Progresión completada!'}
              </h2>
              <p aria-live="polite">
                {lab.feedback ||
                  'Toca con MIDI o con el teclado virtual. Las selecciones del mapa no avanzan la práctica.'}
              </p>
              {practice && (
                <small>
                  {practice.inversion === 0
                    ? 'Posición fundamental'
                    : practice.inversion === null
                      ? 'Cualquier inversión'
                      : `${practice.inversion}.ª inversión`}{' '}
                  · {lab.practiceIndex + 1} de {lab.targets.length}
                </small>
              )}
            </div>
            <div className="practice-controls">
              <select
                aria-label="Dificultad"
                value={lab.level}
                onChange={(e) => lab.startPractice(Number(e.target.value))}
              >
                <option value={1}>Nivel 1 · Tríadas</option>
                <option value={2}>Nivel 2 · Inversiones</option>
                <option value={3}>Nivel 3 · Séptimas</option>
                <option value={4}>Nivel 4 · Rutas largas</option>
              </select>
              <button className="small-button" onClick={() => lab.startPractice()}>
                Nueva progresión
              </button>
              <div className="practice-steps">
                {lab.targets.map((t, i) => (
                  <span
                    className={
                      i < lab.practiceIndex ? 'done' : i === lab.practiceIndex ? 'current' : ''
                    }
                    key={i}
                  >
                    {i < lab.practiceIndex ? '✓ ' : ''}
                    {pretty(chordName(t.chord))}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
        <div className="main-grid">
          <CircleOfFifths selected={lab.keyName} onSelect={lab.changeKey} />
          <HarmonicMap
            current={lab.current}
            chords={
              lab.chordMode === 'both' && lab.current.pcs.length === 4 ? lab.sevenths : lab.chords
            }
            onSelect={lab.select}
          />
          <ChordInspector
            current={lab.current}
            previous={lab.route.length > 1 ? lab.route[lab.route.length - 2] : undefined}
            target={target}
            keyName={lab.keyName}
            inversion={lab.inversion}
            onInversion={lab.changeInversion}
            onPlay={() => void synth.chord(lab.selected)}
            detected={lab.detected}
            suggestion={suggestion}
            onVoicing={() => lab.select(target, suggestion.inversion, suggestion.notes)}
          />
          <section className="panel diatonic-panel">
            <div className="diatonic-label">
              <span className="eyebrow">EN {pretty(lab.keyName).toUpperCase()} MAYOR</span>
              <h2>Acordes diatónicos</h2>
              <small>Todos pueden ser un inicio.</small>
            </div>
            <div className="diatonic-rows">
              <div className="diatonic-row">{lab.chords.map(chordButton)}</div>
              {lab.chordMode === 'both' && (
                <div className="diatonic-row">{lab.sevenths.map(chordButton)}</div>
              )}
            </div>
          </section>
        </div>
        <Progression
          route={lab.route}
          keyName={lab.keyName}
          playing={lab.playing}
          playIndex={lab.playIndex}
          onPlay={lab.playRoute}
          onUndo={() => lab.replaceRoute(lab.route.slice(0, -1))}
          onReset={() => lab.replaceRoute([])}
          onSave={() => setDialog('save')}
          onLibrary={() => setDialog('library')}
          onPreset={(index) =>
            lab.replaceRoute(presetChords(index, lab.keyName, lab.chordMode === 'sevenths'))
          }
          onStep={(index) => lab.replaceRoute(lab.route.slice(0, index + 1))}
        />
        {notice && (
          <div className="notice" role="status">
            {notice}
            <button className="text-button" onClick={() => setNotice('')}>
              Cerrar
            </button>
          </div>
        )}
        <Piano
          selected={lab.selected}
          held={lab.held}
          onDown={lab.down}
          onUp={lab.up}
          onRelease={lab.release}
          velocity={lab.midi.velocity}
          flats={lab.keyName.includes('b') || lab.keyName === 'F'}
        />
        <footer>
          <span>
            ARMONÍA <span className="footer-separator">/</span> La teoría es una guía. Tú eliges el
            camino.
          </span>
          <label className="volume-control">
            <Volume2 size={16} />
            <span>Volumen</span>
            <input
              aria-label="Volumen"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                synth.setVolume(Number(e.target.value) / 100);
              }}
            />
          </label>
        </footer>
      </main>
      {dialog && (
        <Library
          saving={dialog === 'save'}
          saved={saved}
          onClose={() => setDialog(null)}
          onSave={save}
          onLoad={load}
          onDelete={remove}
        />
      )}
    </div>
  );
}
