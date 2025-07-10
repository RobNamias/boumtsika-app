import { useState, useCallback } from 'react';

export function useWebAudio() {
    const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
    const [mediaDestination, setMediaDestination] = useState<MediaStreamAudioDestinationNode | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

    // Fonction à appeler lors d'une interaction utilisateur
    const initAudio = useCallback(() => {
        // Nettoyage des anciens objets si besoin
        if (audioCtx && audioCtx.state !== "closed") {
            audioCtx.close();
        }
        if (mediaDestination) {
            try { mediaDestination.disconnect(); } catch {}
        }
        if (analyser) {
            try { analyser.disconnect(); } catch {}
        }

        // Création des nouveaux objets
        const ctx = new window.AudioContext();
        setAudioCtx(ctx);
        setMediaDestination(ctx.createMediaStreamDestination());
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 256;
        setAnalyser(analyserNode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { audioCtx, mediaDestination, analyser, initAudio };
}