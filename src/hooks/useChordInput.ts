import { useEffect, useState } from 'react';
import { detectChord, type DetectedChord } from '../midi/chordDetector';
export function useChordInput(notes: number[], key: string) {
  const [result, setResult] = useState<{
    signature: string;
    key: string;
    detected: DetectedChord | null;
  } | null>(null);
  const signature = notes.join(',');
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setResult({
          signature,
          key,
          detected: detectChord(signature ? signature.split(',').map(Number) : [], key),
        }),
      140,
    );
    return () => clearTimeout(timer);
  }, [signature, key]);
  return result?.signature === signature && result.key === key ? result.detected : null;
}
