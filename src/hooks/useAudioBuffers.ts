import { useEffect, useState } from 'react';

export function useAudioBuffers(ctx: AudioContext, drums: { type: string, path: string }[]) {
    const [buffers, setBuffers] = useState<Record<string, AudioBuffer>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        const load = async () => {
            const entries = await Promise.all(drums.map(async drum => {
                const res = await fetch(drum.path);
                const arr = await res.arrayBuffer();
                const buffer = await ctx.decodeAudioData(arr);
                return [drum.type, buffer] as const;
            }));
            if (isMounted) {
                setBuffers(Object.fromEntries(entries));
                setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [ctx, drums]);

    return { buffers, loading };
}