import { parseMidi, type MidiNoteEvent } from './midiParser';
export type MidiStatus =
  | 'MIDI desconectado'
  | 'MIDI conectado'
  | 'No hay dispositivos'
  | 'Permiso MIDI rechazado'
  | 'MIDI no compatible'
  | 'Error de conexión MIDI';
export interface MidiDevice {
  id: string;
  name: string;
}
export interface MidiSnapshot {
  status: MidiStatus;
  devices: MidiDevice[];
  selectedId: string;
  notes: number[];
  velocity: number;
}
export interface MidiSource {
  connect(): Promise<void>;
  select(id: string): void;
  subscribe(listener: (state: MidiSnapshot) => void): () => void;
  dispose(): void;
}
export class MidiManager implements MidiSource {
  private access: MIDIAccess | null = null;
  private listeners = new Set<(state: MidiSnapshot) => void>();
  private held = new Map<string, number>();
  private input: MIDIInput | null = null;
  private state: MidiSnapshot = {
    status: 'MIDI desconectado',
    devices: [],
    selectedId: '',
    notes: [],
    velocity: 0,
  };
  subscribe(listener: (state: MidiSnapshot) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private emit(patch: Partial<MidiSnapshot>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn(this.state));
  }
  async connect() {
    if (!navigator.requestMIDIAccess) {
      this.emit({ status: 'MIDI no compatible' });
      return;
    }
    try {
      this.access = await navigator.requestMIDIAccess({ sysex: false });
      this.access.onstatechange = () => this.refresh();
      this.refresh();
    } catch (error) {
      this.emit({
        status:
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'Permiso MIDI rechazado'
            : 'Error de conexión MIDI',
      });
    }
  }
  private refresh() {
    const devices = [...this.access!.inputs.values()]
      .filter((i) => i.state === 'connected')
      .map((i) => ({ id: i.id, name: i.name || 'Teclado MIDI' }));
    this.emit({ devices });
    if (!devices.some((d) => d.id === this.state.selectedId)) this.select(devices[0]?.id ?? '');
  }
  select(id: string) {
    if (this.input) this.input.onmidimessage = null;
    this.held.clear();
    this.input = this.access?.inputs.get(id) ?? null;
    if (this.input)
      this.input.onmidimessage = (event) => {
        if (event.data) {
          const parsed = parseMidi(event.data);
          if (parsed) this.receive(parsed);
        }
      };
    this.emit({
      selectedId: this.input?.id ?? '',
      status: this.input ? 'MIDI conectado' : 'No hay dispositivos',
      notes: [],
      velocity: 0,
    });
  }
  private receive(event: MidiNoteEvent) {
    const id = `${event.channel}:${event.note}`;
    if (event.type === 'on') this.held.set(id, event.note);
    else this.held.delete(id);
    this.emit({
      notes: [...new Set(this.held.values())].sort((a, b) => a - b),
      velocity: event.type === 'on' ? event.velocity : this.state.velocity,
    });
  }
  dispose() {
    if (this.input) this.input.onmidimessage = null;
    if (this.access) this.access.onstatechange = null;
    this.held.clear();
    this.access = null;
    this.input = null;
  }
}
