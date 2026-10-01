import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { chordName, sameChord, type Chord } from '../musicTheory/chords';
import { functionLabels, harmonicFunction } from '../musicTheory/harmonicFunctions';
import { relatedDegrees, relation } from '../musicTheory/chordRelations';
import { pretty } from '../musicTheory/notes';
interface Props {
  current: Chord;
  chords: Chord[];
  onSelect: (chord: Chord) => void;
}
export function HarmonicMap({ current, chords, onSelect }: Props) {
  const [hovered, setHovered] = useState<Chord | null>(null);
  const suggestions = relatedDegrees(current.degree)
    .map((d) => chords[d])
    .filter((c) => !sameChord(c, current));
  const activeHover = hovered && suggestions.some((c) => sameChord(c, hovered)) ? hovered : null;
  const hint = activeHover
    ? relation(current, activeHover).explanation
    : 'Elige un destino para escuchar el cambio y continuar tu ruta.';
  const positions = suggestions.map((_, i) => {
    const angle = ((-90 + (i * 360) / suggestions.length) * Math.PI) / 180;
    return [280 + Math.cos(angle) * 192, 185 + Math.sin(angle) * 137];
  });
  return (
    <section className="panel map-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">02 / RELACIONES</span>
          <h2>¿A dónde puedo ir?</h2>
        </div>
        <span className="live-label">
          <span />
          Exploración libre
        </span>
      </div>
      <svg
        className="map-svg"
        viewBox="0 0 560 365"
        aria-label={`Movimientos sugeridos desde ${chordName(current)}`}
      >
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="#344044" />
          </pattern>
        </defs>
        <rect width="560" height="365" fill="url(#dots)" />
        <circle cx="280" cy="185" r="104" fill="none" stroke="#263236" strokeDasharray="3 7" />
        {suggestions.map((c, i) => {
          const r = relation(current, c);
          return (
            <line
              key={`line-${c.degree}`}
              x1="280"
              y1="185"
              x2={positions[i][0]}
              y2={positions[i][1]}
              className={`map-edge ${harmonicFunction(c.degree)}`}
              strokeWidth={r.weight}
              strokeDasharray={r.strength === 'Suave' ? '5 5' : undefined}
            />
          );
        })}
        {suggestions.map((c, i) => (
          <g
            key={chordName(c)}
            role="button"
            tabIndex={0}
            aria-label={`Ir a ${chordName(c)}: ${relation(current, c).explanation}`}
            className={`map-node ${harmonicFunction(c.degree)}`}
            onMouseEnter={() => setHovered(c)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(c)}
            onBlur={() => setHovered(null)}
            onClick={() => onSelect(c)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(c);
              }
            }}
          >
            <title>
              {relation(current, c).strength}: {relation(current, c).explanation}
            </title>
            <rect
              x={positions[i][0] - 53}
              y={positions[i][1] - 31}
              width="106"
              height="65"
              rx="13"
            />
            <text x={positions[i][0]} y={positions[i][1] - 3} className="node-name">
              {pretty(chordName(c))}
            </text>
            <text x={positions[i][0]} y={positions[i][1] + 19} className="node-roman">
              {c.roman} · {functionLabels[harmonicFunction(c.degree)]}
            </text>
          </g>
        ))}
        <g className={`map-center ${harmonicFunction(current.degree)}`}>
          <circle cx="280" cy="185" r="54" />
          <text x="280" y="169" className="current-label">
            ESTÁS AQUÍ
          </text>
          <text x="280" y="197" className="center-name">
            {pretty(chordName(current))}
          </text>
          <text x="280" y="217" className="node-roman">
            {current.roman}
          </text>
        </g>
      </svg>
      <div className="map-hint">
        <ArrowUpRight size={18} />
        <span>{hint}</span>
      </div>
      <div className="map-legend">
        <span>
          <i className="tonic" />
          Tónica
        </span>
        <span>
          <i className="predominant" />
          Predominante
        </span>
        <span>
          <i className="dominant" />
          Dominante
        </span>
        <span
          title="Más grosor: relación fuerte; discontinua: notas compartidas"
          className="line-legend"
        >
          ━ Fuerte · ┄ Suave
        </span>
      </div>
    </section>
  );
}
