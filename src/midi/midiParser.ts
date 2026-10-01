export type MidiNoteEvent = { type: 'on' | 'off'; note: number; velocity: number; channel: number };
export function parseMidi(data: ArrayLike<number>): MidiNoteEvent | null {
  if (data.length < 3 || data[1] > 127 || data[2] > 127) return null;
  const status = data[0] & 0xf0;
  if (status !== 0x90 && status !== 0x80) return null;
  return {
    type: status === 0x80 || data[2] === 0 ? 'off' : 'on',
    note: data[1],
    velocity: data[2],
    channel: data[0] & 0x0f,
  };
}
