import { useRef } from 'react';

export function useWebAudio() {
    const ctxRef = useRef<AudioContext | null>(null);
    const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    if (!ctxRef.current) {
        ctxRef.current = new (
            window.AudioContext ||
            (window as any).webkitAudioContext
        )();
    }
    if (!destRef.current && ctxRef.current) {
        destRef.current = ctxRef.current.createMediaStreamDestination();
    }

    return { audioCtx: ctxRef.current, mediaDestination: destRef.current };
}