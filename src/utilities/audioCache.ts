const audioCache: Record<string, HTMLAudioElement> = {};

export function getAudio(url: string): HTMLAudioElement {
    if (!audioCache[url]) {
        const audio = new Audio(url);
        audioCache[url] = audio;
    }
    return audioCache[url];
}

export function clearAudioCache(): void {
    Object.keys(audioCache).forEach(url => {
        delete audioCache[url];
    });
}