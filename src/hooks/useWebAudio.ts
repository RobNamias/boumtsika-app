import { useState, useCallback } from 'react';

export function useWebAudio() {
    const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
    const [mediaDestination, setMediaDestination] = useState<MediaStreamAudioDestinationNode | null>(null);

    // Fonction à appeler lors d'une interaction utilisateur
    const initAudio = useCallback(() => {
        if (!audioCtx || audioCtx.state === "closed") {
            const ctx = new window.AudioContext();
            setAudioCtx(ctx);
            setMediaDestination(ctx.createMediaStreamDestination());
        } else if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }, [audioCtx]);

    return { audioCtx, mediaDestination, initAudio };
}