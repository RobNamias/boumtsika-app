import { DrumType } from "./DrumType";

export interface DrumSet {
    type: keyof typeof DrumType;
    path: string;
    audio: HTMLAudioElement;
    volume: number;
    //sequenceIndexes: bool[false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
}