const audioBufferCache: Record<string, AudioBuffer> = {};

export function getCachedBuffer(key: string): AudioBuffer | undefined {
    return audioBufferCache[key];
}

export function setCachedBuffer(key: string, buffer: AudioBuffer) {
    audioBufferCache[key] = buffer;
}

export function clearAudioBufferCache() {
    Object.keys(audioBufferCache).forEach(key => delete audioBufferCache[key]);
}