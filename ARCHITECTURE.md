# Armonía · arquitectura

Aplicación local React + TypeScript estricto + Vite, sin backend. La interfaz usa hooks para orquestar módulos independientes. Las progresiones se guardan en LocalStorage (versionadas y validadas).

## Modelo musical

Pitch classes enteras 0–11 para cálculos; MIDI 0–127 para altura y bajo real. Una nota escrita conserva letra y alteración; las escalas se deletrean por grados, preservando E# en F# mayor y Cb en Gb mayor. Un acorde tiene raíz numérica, calidad, notas escritas, grado opcional y función. Las relaciones usan grados, nunca nombres de acordes. Los acordes externos se etiquetan cromáticos respecto a la tonalidad.

- `musicTheory/`: funciones puras de escalas, acordes, relaciones, rutas e inversiones. Los nodos tienen identidad musical independiente de su vista; una futura vista Tonnetz puede consumir raíz/calidad/pitch classes.
- `midi/`: parser puro, detector puro y administrador de dispositivos. Solamente el administrador solicita Web MIDI. Filtra entrada elegida, canal/nota, velocidad cero como Note Off y libera notas al desconectar/cambiar entrada.
- `audio/`: sintetizador Web Audio con envolvente, control de volumen y cancelación de reproducción.
- `hooks/`: conexión entre MIDI, detección estable y UI. Detección tras 140 ms sin cambios, para evitar transiciones durante ataques de acordes.
- `components/`: círculo SVG, mapa SVG, piano, panel de acorde y controles de progresión.

La práctica exige liberar las notas antes de aceptar otro acorde. Nivel 1 pide posición fundamental; nivel 2 pide inversiones concretas; nivel 3 usa séptimas y nivel 4 rutas más largas. Las selecciones visuales no completan la práctica.

## Límites de reconocimiento

Se reconocen conjuntos completos de 3 o 4 pitch classes, con duplicados de octava permitidos. Acordes simétricos y algunas equivalencias (sus2/sus4) pueden tener varias lecturas: se prioriza la tonalidad, luego la raíz en el bajo, y se muestran alternativas. No se interpretan acordes incompletos, pedal de sustain ni intención musical.
