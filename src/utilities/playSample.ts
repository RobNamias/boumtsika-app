export function playSample(
    audioCtx: AudioContext,
    buffer: AudioBuffer,
    volume: number,
    mediaDestination?: AudioNode
) {
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(audioCtx.destination);
    if (mediaDestination) {
        gain.connect(mediaDestination);
    }
    source.start();
}