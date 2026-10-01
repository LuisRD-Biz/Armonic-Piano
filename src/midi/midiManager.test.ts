import { afterEach, describe, expect, it, vi } from 'vitest';
import { MidiManager, type MidiSnapshot } from './midiManager';
type FakeInput = {
  id: string;
  name: string;
  state: string;
  onmidimessage: ((event: { data: Uint8Array }) => void) | null;
};
function setup() {
  const input: FakeInput = {
    id: 'piano',
    name: 'Piano USB',
    state: 'connected',
    onmidimessage: null,
  };
  const access = {
    inputs: new Map([['piano', input]]),
    onstatechange: null as (() => void) | null,
  };
  vi.stubGlobal('navigator', { requestMIDIAccess: vi.fn().mockResolvedValue(access) });
  const manager = new MidiManager();
  let snapshot: MidiSnapshot;
  manager.subscribe((state) => {
    snapshot = state;
  });
  const send = (bytes: number[]) => input.onmidimessage?.({ data: new Uint8Array(bytes) });
  return {
    manager,
    input,
    access,
    send,
    get snapshot() {
      return snapshot!;
    },
  };
}
afterEach(() => vi.unstubAllGlobals());
describe('Adaptador Web MIDI', () => {
  it('conecta, lee velocidad y libera notas', async () => {
    const s = setup();
    await s.manager.connect();
    expect(s.snapshot.status).toBe('MIDI conectado');
    s.send([0x90, 60, 91]);
    expect(s.snapshot.notes).toEqual([60]);
    expect(s.snapshot.velocity).toBe(91);
    s.send([0x90, 60, 0]);
    expect(s.snapshot.notes).toEqual([]);
  });
  it('separa canales al soltar una nota', async () => {
    const s = setup();
    await s.manager.connect();
    s.send([0x90, 60, 91]);
    s.send([0x91, 60, 90]);
    s.send([0x80, 60, 0]);
    expect(s.snapshot.notes).toEqual([60]);
    s.send([0x81, 60, 0]);
    expect(s.snapshot.notes).toEqual([]);
  });
  it('desconectar limpia el piano y reconectar restaura la entrada', async () => {
    const s = setup();
    await s.manager.connect();
    s.send([0x90, 60, 91]);
    s.input.state = 'disconnected';
    s.access.onstatechange?.();
    expect(s.snapshot.status).toBe('No hay dispositivos');
    expect(s.snapshot.notes).toEqual([]);
    expect(s.input.onmidimessage).toBeNull();
    s.input.state = 'connected';
    s.access.onstatechange?.();
    expect(s.snapshot.status).toBe('MIDI conectado');
  });
  it('cambiar entrada elimina callbacks y notas anteriores', async () => {
    const s = setup();
    await s.manager.connect();
    s.send([0x90, 60, 100]);
    const second = { ...s.input, id: 'second', name: 'Otro piano', onmidimessage: null };
    s.access.inputs.set('second', second);
    s.manager.select('second');
    expect(s.snapshot.notes).toEqual([]);
    expect(s.input.onmidimessage).toBeNull();
    expect(s.snapshot.selectedId).toBe('second');
  });
  it('distingue permiso rechazado', async () => {
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError')),
    });
    const m = new MidiManager();
    let status = '';
    m.subscribe((s) => {
      status = s.status;
    });
    await m.connect();
    expect(status).toBe('Permiso MIDI rechazado');
  });
  it('informa navegador incompatible', async () => {
    vi.stubGlobal('navigator', {});
    const m = new MidiManager();
    let status = '';
    m.subscribe((s) => {
      status = s.status;
    });
    await m.connect();
    expect(status).toBe('MIDI no compatible');
  });
  it('dispose elimina listeners de hardware', async () => {
    const s = setup();
    await s.manager.connect();
    s.manager.dispose();
    expect(s.input.onmidimessage).toBeNull();
    expect(s.access.onstatechange).toBeNull();
  });
});
