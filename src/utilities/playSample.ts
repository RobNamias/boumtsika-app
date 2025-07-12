export function playSample(
    audioCtx: AudioContext,
    buffer: AudioBuffer,
    volume: number,
    mediaDestination?: AudioNode,
    analyser?: AnalyserNode
) {
    // On garde uniquement les logs d'erreur
    if (!audioCtx) {
        console.error("playSample: audioCtx manquant");
        return;
    }
    if (!buffer) {
        console.error("playSample: buffer manquant");
        return;
    }
    if (volume <= 0) {
        console.warn("playSample: volume <= 0", volume);
        return;
    }

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
        try { source.disconnect(); } catch (e) { console.debug("[DEBUG] source.disconnect error", e); }
        try { gain.disconnect(); } catch (e) { console.debug("[DEBUG] gain.disconnect error", e); }
    };

    source.start();
}