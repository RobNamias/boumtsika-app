export function playSample(
    audioCtx: AudioContext,
    buffer: AudioBuffer,
    volume: number,
    mediaDestination?: AudioNode
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
    if (mediaDestination) {
        gain.connect(mediaDestination);
        // console.log("playSample: connecté à mediaDestination");
    } else {
        gain.connect(audioCtx.destination);
        // console.log("playSample: connecté à audioCtx.destination");
    }
    source.start();
}