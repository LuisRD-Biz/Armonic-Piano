# Armonic-Piano

**Armonía · Laboratorio musical** — Aplicación para aprender teoría de piano explorando acordes y progresiones.

Una aplicación local para explorar relaciones armónicas con un teclado MIDI USB, un piano virtual y rutas visuales. React + TypeScript estricto + Vite. Sin backend ni cuentas.

## Ejecutar

Requiere Node.js 22 o posterior y npm.

```sh
npm install
npm run dev
```

Abre la dirección local que muestra Vite. Para comprobar y compilar:

```sh
npm test
npm run build
npm run preview
```

## Cómo explorar

1. Selecciona una tonalidad en el círculo o en el selector. El círculo cambia la tonalidad y reproduce su tónica.
2. Elige un acorde diatónico. El mapa muestra destinos con relaciones funcionales, compartiendo el mismo modelo en todas las tonalidades.
3. Pulsa un destino para escucharlo y añadirlo a la ruta. Todos los acordes diatónicos siguen disponibles, aunque no aparezcan entre las sugerencias.
4. Cambia entre tríadas, séptimas o ambas. Usa las flechas del panel de acorde para escuchar inversiones.
5. Deshaz el último paso, vuelve a un punto de la ruta, reiníciala, repítela o guárdala con un nombre.

Las progresiones guardadas viven únicamente en el LocalStorage del navegador; borrar los datos del sitio las elimina. El selector de progresiones incluye pop, clásica, jazz, una vuelta de blues de seis acordes y canon. El blues usa acordes dominantes reales; no es un blues completo de doce compases.

## Piano y MIDI

Conecta el piano por USB y pulsa **Conectar MIDI**. Permite el acceso y selecciona la entrada correspondiente. Se usa Web MIDI sin SysEx, desde localhost o HTTPS. Si el navegador no dispone de la API, la interfaz muestra una explicación y el piano virtual sigue disponible.

- Se leen Note On, Note Off, canal y velocity. Note On con velocity cero equivale a Note Off.
- Se iluminan las notas sostenidas dentro de las tres octavas visibles C3–C6; las notas fuera de ese rango siguen participando en el reconocimiento.
- Se reconocen mayor, menor, disminuido, aumentado, sus2, sus4, maj7, m7, 7, m7♭5 y dim7, incluyendo inversiones y duplicados de octava.
- Hay una ventana de estabilización de 140 ms para reducir cambios espurios al pulsar varias teclas.
- Los acordes ambiguos muestran lecturas alternativas. Las notas incompletas y grupos no reconocidos no se fuerzan a un nombre.
- El sonido usa un sintetizador Web Audio con envolvente; no son muestras acústicas de piano. El volumen puede ponerse en cero para escuchar únicamente el instrumento físico.

Sin MIDI: usa **A W S E D F T G Y H U J K O L P ;**, desde C4 a E5, o el piano en pantalla. Activa **Retener notas** para construir acordes mediante clics sucesivos; **Soltar** libera las notas virtuales. Los campos de texto no disparan notas.

## Práctica

- Nivel 1: tríadas en posición fundamental.
- Nivel 2: tríadas con la inversión solicitada.
- Nivel 3: séptimas, cualquier inversión.
- Nivel 4: progresiones más largas.

Toca con MIDI o con el piano virtual. Seleccionar un acorde del mapa no completa un ejercicio. Hay que soltar todas las notas antes del siguiente acorde. **Nueva progresión** recorre variantes educativas reproducibles.

## Arquitectura y pruebas

Consulta [ARCHITECTURE.md](ARCHITECTURE.md). La teoría es independiente de React; MIDI y audio son adaptadores separados. El modelo puede alimentar una futura vista Tonnetz sin cambiar las relaciones funcionales.

La suite comprueba las escalas mayor y menor natural, ortografía enarmónica, transposición, séptimas, las once familias de acordes en todas las raíces e inversiones, conducción de voces, parsing MIDI, canales, desconexión, selección de dispositivos y errores de permisos. Se verificaron además en navegador los controles, guardado/carga, rutas, teclado, práctica y ausencia de desbordamiento horizontal a 390 px.

**Pendiente de validación con hardware real:** conexión USB y latencia en un piano físico. Las pruebas MIDI automatizadas usan dispositivos simulados. El pedal de sustain, acordes incompletos, tempo configurable, tonalidades menores en la interfaz y Tonnetz quedan fuera de esta primera versión. El motor sí incluye menor natural con pruebas.

## Datos y recursos

No se envían notas MIDI ni progresiones a un servidor. Las tipografías se solicitan a Google Fonts; si no hay conexión se usan fuentes del sistema. El resto de la aplicación funciona localmente tras instalar las dependencias.
