import React, { useState, useRef, useEffect } from 'react';

export type AudioRecorderProps = {
    audioCtx: AudioContext | null;
    mediaDestination: MediaStreamAudioDestinationNode | null;
    loading: boolean;
    isRecording: boolean;
    setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
};

const AudioRecorder: React.FC<AudioRecorderProps> = ({ audioCtx, mediaDestination, loading, isRecording, setIsRecording }) => {
    // On ne stocke plus de state recorder, on utilise uniquement recorderRef
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const recorderRef = useRef<MediaRecorder | null>(null);


    // On ne crée le MediaRecorder qu'au moment du startRecording

    useEffect(() => {
        return () => {
            const recorderCleanup = recorderRef.current;
            if (recorderCleanup && recorderCleanup.state !== "inactive") {
                recorderCleanup.stop();
            }
            if (audioURL) URL.revokeObjectURL(audioURL);
        };
    }, [audioURL]); // audioURL ajouté dans le tableau de dépendances

    const startRecording = () => {
        chunksRef.current = [];
        // Vérifie que le contexte audio est running
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        if (!mediaDestination || !audioCtx || audioCtx.state !== "running") return;
        // Joue un son muet pour activer le flux sur Chrome
        if (audioCtx && mediaDestination) {
            const source = audioCtx.createBufferSource();
            const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate / 10, audioCtx.sampleRate); // 0.1s
            source.buffer = buffer;
            source.connect(mediaDestination);
            source.start();
        }
        // Crée le MediaRecorder à la demande
        let mimeType = '';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
            mimeType = 'audio/wav';
        } else {
            mimeType = '';
        }
        const newRecorder = mimeType
            ? new MediaRecorder(mediaDestination.stream, { mimeType })
            : new MediaRecorder(mediaDestination.stream);
        newRecorder.onstart = () => {
            setIsRecording(true);
        };
        newRecorder.ondataavailable = e => {
            chunksRef.current.push(e.data);
        };
        newRecorder.onstop = () => {
            setIsRecording(false);
            if (audioURL) URL.revokeObjectURL(audioURL);
            const webmBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
            // Conversion webm -> wav
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target?.result;
                    if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer)) return;
                    if (!audioCtx) throw new Error("audioCtx null");
                    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer as ArrayBuffer);
                    const encodeWAV = (audioBuffer: AudioBuffer): ArrayBuffer => {
                        const numChannels = audioBuffer.numberOfChannels;
                        const sampleRate = audioBuffer.sampleRate;
                        const format = 1; // PCM
                        const bitDepth = 16;
                        const samples = audioBuffer.length;
                        const blockAlign = numChannels * bitDepth / 8;
                        const byteRate = sampleRate * blockAlign;
                        const dataLength = samples * blockAlign;
                        const buffer = new ArrayBuffer(44 + dataLength);
                        const view = new DataView(buffer);
                        view.setUint32(0, 0x52494646, false); // 'RIFF'
                        view.setUint32(4, 36 + dataLength, true);
                        view.setUint32(8, 0x57415645, false); // 'WAVE'
                        view.setUint32(12, 0x666d7420, false); // 'fmt '
                        view.setUint32(16, 16, true); // chunk size
                        view.setUint16(20, format, true); // PCM
                        view.setUint16(22, numChannels, true);
                        view.setUint32(24, sampleRate, true);
                        view.setUint32(28, byteRate, true);
                        view.setUint16(32, blockAlign, true);
                        view.setUint16(34, bitDepth, true);
                        view.setUint32(36, 0x64617461, false); // 'data'
                        view.setUint32(40, dataLength, true);
                        let offset = 44;
                        for (let i = 0; i < samples; i++) {
                            for (let ch = 0; ch < numChannels; ch++) {
                                let sample = audioBuffer.getChannelData(ch)[i];
                                sample = Math.max(-1, Math.min(1, sample));
                                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                                offset += 2;
                            }
                        }
                        return buffer;
                    };
                    const wavBuffer = encodeWAV(audioBuffer);
                    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
                    const wavUrl = URL.createObjectURL(wavBlob);
                    setAudioURL(wavUrl);
                } catch (err) {
                    const url = URL.createObjectURL(webmBlob);
                    setAudioURL(url);
                }
            };
            reader.readAsArrayBuffer(webmBlob);
            chunksRef.current = [];
        };
        newRecorder.onerror = (e) => {
            setIsRecording(false);
        };
        recorderRef.current = newRecorder;
        newRecorder.start();
    };
    const stopRecording = () => {
        if (recorderRef.current && recorderRef.current.state === "recording") {
            recorderRef.current.stop();
        }
    };

    return (
        <div id="container_recording_controls">
            {!isRecording && (
                <button className="button_menu" onClick={startRecording} disabled={loading}>
                    🔴REC
                </button>
            )}
            {isRecording && (
                <button className="button_menu lecture_en_cours" onClick={stopRecording} disabled={loading}>
                    Arrêter
                </button>
            )}
            {audioURL && (
                <>
                    <audio controls src={audioURL} />
                    <a className="button_menu" href={audioURL} download="drumbox_recording.wav" style={{ textDecoration: "none", marginRight: 8, height: "60px", width: "60px", border: "0" }}>
                        💾 Exporter
                    </a>
                    <button className="button_menu" onClick={() => { if (audioURL) URL.revokeObjectURL(audioURL); setAudioURL(null); }} style={{ marginRight: 8 }}>
                        ❌ Effacer
                    </button>
                </>
            )}
        </div>
    );
};

export default AudioRecorder;
