import { useEffect, useState } from 'react';
import { getCachedBuffer, setCachedBuffer } from '../utilities/audioBufferCache';

export function useAudioBuffers(audioCtx: AudioContext | null, drums: { type: string, path: string }[]) {
  const [buffers, setBuffers] = useState<{ [key: string]: AudioBuffer }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!audioCtx) return;

    setLoading(true);
    const load = async () => {
      try {
        const entries = await Promise.all(drums.map(async drum => {
          // Utilise drum.path comme clé unique pour le cache
          const cached = getCachedBuffer(drum.path);
          if (cached) {
            return [drum.type, cached] as const;
          }
          const res = await fetch(drum.path);
          if (!res.ok) {
            throw new Error(`Erreur de chargement du fichier audio : ${drum.path}`);
          }
          const arr = await res.arrayBuffer();
          try {
            const buffer = await audioCtx.decodeAudioData(arr);
            setCachedBuffer(drum.path, buffer);
            return [drum.type, buffer] as const;
          } catch (e) {
            console.error(`Erreur de décodage du fichier audio : ${drum.path}`, e);
            return [drum.type, null] as const;
          }
        }));
        setBuffers(
          Object.fromEntries(
            entries.filter(([_, buffer]) => buffer !== null) as [string, AudioBuffer][]
          )
        );
      } catch (e) {
        console.error("Erreur lors du chargement des buffers audio :", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [audioCtx, drums]);

  return { buffers, loading };
}