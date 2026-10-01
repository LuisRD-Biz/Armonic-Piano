import { useEffect, useState } from 'react';
import { MidiManager, type MidiSnapshot } from '../midi/midiManager';
export function useMidi() {
  const [manager] = useState(() => new MidiManager());
  const [state, setState] = useState<MidiSnapshot>({
    status: 'MIDI desconectado',
    devices: [],
    selectedId: '',
    notes: [],
    velocity: 0,
  });
  useEffect(() => {
    const unsubscribe = manager.subscribe(setState);
    return () => {
      unsubscribe();
      manager.dispose();
    };
  }, [manager]);
  return { ...state, connect: () => manager.connect(), select: (id: string) => manager.select(id) };
}
