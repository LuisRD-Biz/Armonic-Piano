import { ChevronLeft, ChevronRight } from 'lucide-react';
import { circleKeys, relativeMinor, signatures } from '../musicTheory/keys';
import { pitch, pretty } from '../musicTheory/notes';
interface Props {
  selected: string;
  onSelect: (key: string) => void;
}
export function CircleOfFifths({ selected, onSelect }: Props) {
  const index = circleKeys.findIndex((k) => pitch(k) === pitch(selected));
  const move = (step: number) => onSelect(circleKeys[(index + step + 12) % 12]);
  return (
    <section className="panel circle-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">01 / TONALIDAD</span>
          <h2>Círculo de quintas</h2>
        </div>
        <span className="small-label">Mayor · menor</span>
      </div>
      <svg
        className="circle-svg"
        viewBox="0 0 400 374"
        aria-label="Círculo de quintas; selecciona una tonalidad"
      >
        <circle cx="200" cy="187" r="153" className="circle-guide" />
        <circle cx="200" cy="187" r="106" className="circle-guide inner" />
        {circleKeys.map((key, i) => {
          const angle = ((i * 30 - 90) * Math.PI) / 180;
          const x = 200 + 145 * Math.cos(angle),
            y = 187 + 145 * Math.sin(angle);
          const active = index === i;
          return (
            <g
              key={key}
              role="button"
              tabIndex={0}
              aria-label={`${key} mayor, relativo ${relativeMinor(key)}`}
              aria-pressed={active}
              className={`circle-key ${active ? 'selected' : ''}`}
              onClick={() => onSelect(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(key);
                }
              }}
            >
              <circle cx={x} cy={y} r="24" />
              <text x={x} y={y + 5} className="key-major">
                {i === 6 ? 'F♯/G♭' : pretty(key)}
              </text>
              <text
                x={200 + 96 * Math.cos(angle)}
                y={192 + 96 * Math.sin(angle)}
                className="key-minor"
              >
                {pretty(relativeMinor(key))}
              </text>
            </g>
          );
        })}
        <text x="200" y="165" className="circle-caption">
          TONALIDAD ACTUAL
        </text>
        <text x="200" y="207" className="circle-tonic">
          {pretty(selected)}
          <tspan className="circle-mode"> mayor</tspan>
        </text>
        <text x="200" y="234" className="circle-relative">
          {pretty(relativeMinor(selected))} relativo · {signatures[index]}
        </text>
      </svg>
      <div className="circle-navigation">
        <button className="icon-button" aria-label="Quinta descendente" onClick={() => move(-1)}>
          <ChevronLeft size={18} />
        </button>
        <span>Explora por quintas</span>
        <button className="icon-button" aria-label="Quinta ascendente" onClick={() => move(1)}>
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
