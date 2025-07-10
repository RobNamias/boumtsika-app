export function playSample(
    audioCtx: AudioContext,
    buffer: AudioBuffer,
    volume: number,
    mediaDestination?: AudioNode,
    analyser?: AnalyserNode
) {
    if (!audioCtx) {
        console.error("playSample: audioCtx manquant");
        return;
    }
    if (!buffer) {
        console.error("playSample: buffer manquant");
        return;
    }
    if (audioCtx.state !== "running") {
        console.warn("playSample: AudioContext n'est pas running, état:", audioCtx.state);
    }
    if (volume <= 0) {
        console.warn("playSample: volume <= 0", volume);
    }
    // console.log("playSample: lecture", { volume, mediaDestination, bufferDuration: buffer.duration });

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.value = volume;
    source.connect(gain);

    if (analyser) {
        gain.connect(analyser);
        if (mediaDestination) {
            analyser.connect(mediaDestination);
        } else {
            analyser.connect(audioCtx.destination);
        }
    } else if (mediaDestination) {
        gain.connect(mediaDestination);
    } else {
        gain.connect(audioCtx.destination);
    }

    // Nettoyage AVANT start
    source.onended = () => {
        try { source.disconnect(); } catch {}
        try { gain.disconnect(); } catch {}
        // Ne pas déconnecter analyser ici, il peut être partagé !
    };

    source.start();
}