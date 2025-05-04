import { DrumType } from "./DrumType";

export interface DrumSet {
    type: keyof typeof DrumType;
    drumKit: string;
    path: string;
    audio: HTMLAudioElement;
    is_active: boolean
}