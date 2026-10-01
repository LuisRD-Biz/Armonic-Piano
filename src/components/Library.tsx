import { useEffect, useRef, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { chordName } from '../musicTheory/chords';
import { pretty } from '../musicTheory/notes';
import type { SavedProgression } from '../storage';
interface Props {
  saving: boolean;
  saved: SavedProgression[];
  onClose: () => void;
  onSave: (name: string) => void;
  onLoad: (p: SavedProgression) => void;
  onDelete: (id: string) => void;
}
export function Library({ saving, saved, onClose, onSave, onLoad, onDelete }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('Mi progresión');
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} className="library-dialog" onCancel={onClose}>
      <div className="panel-heading">
        <h2>{saving ? 'Guardar progresión' : 'Tus progresiones'}</h2>
        <button className="icon-button" aria-label="Cerrar" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {saving ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onSave(name.trim());
          }}
        >
          <label htmlFor="progression-name">Nombre</label>
          <input
            id="progression-name"
            autoFocus
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <p className="muted">Se guarda en este navegador, junto con la tonalidad.</p>
          <button className="primary-button" type="submit">
            Guardar progresión
          </button>
        </form>
      ) : (
        <div className="saved-list">
          {saved.length === 0 ? (
            <p className="muted">
              Todavía no hay progresiones. Construye una ruta y pulsa Guardar.
            </p>
          ) : (
            saved.map((p) => (
              <div className="saved-row" key={p.id}>
                <button onClick={() => onLoad(p)}>
                  <strong>{p.name}</strong>
                  <span>
                    {pretty(p.key)} mayor · {p.chords.map((c) => pretty(chordName(c))).join(' → ')}
                  </span>
                </button>
                <button
                  className="icon-button"
                  onClick={() => onDelete(p.id)}
                  aria-label={`Eliminar ${p.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </dialog>
  );
}
