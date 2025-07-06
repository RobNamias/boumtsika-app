import { useEffect, useState } from 'react';

export function useAudioBuffers(audioCtx: AudioContext | null, drums: { type: string, path: string }[]) {
  const [buffers, setBuffers] = useState<{ [key: string]: AudioBuffer }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!audioCtx) return; // Ne rien faire tant qu'il n'y a pas de contexte audio

    setLoading(true);
    const load = async () => {
      const entries = await Promise.all(drums.map(async drum => {
        const res = await fetch(drum.path);
        const arr = await res.arrayBuffer();
        const buffer = await audioCtx.decodeAudioData(arr);
        return [drum.type, buffer] as const;
      }));
      setBuffers(Object.fromEntries(entries));
      setLoading(false);
    };
    load();
  }, [audioCtx, drums]);

  return { buffers, loading };
}