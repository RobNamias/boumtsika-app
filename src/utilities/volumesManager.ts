import { DrumSet } from "../models/DrumSet"
import { DrumType } from "../models/DrumType"
import { patternLength } from "./patternManager"

const initialVolumeArray: number[] = [80, 80, 80, 80, 80]
const initialVolumesBySpan: number[][] = [[], [], [], [], []]
const initialDegreesOfGroove: number[] = [3, 3, 3, 3, 3]

// for (let i = 0; i < initialVolumesBySpan.length; i++) {
for (let i = 0; i < initialVolumesBySpan.length; i++) {
    for (let j = 0; j < patternLength; j++) {
        initialVolumesBySpan[i].push(50);
        // initialVolumesBySpan[i].push(Math.random() * 100);
    }
}


export var VolumeArray = initialVolumeArray
export var VolumesBySpan = initialVolumesBySpan
export var DegreesOfGroove = initialDegreesOfGroove

export function setDegOfGroove(newDegOfGroove: number[]) {
    DegreesOfGroove = newDegOfGroove
}

export function setDegOfGrooveByIndex(index: number, newValue: number) {
    DegreesOfGroove[index] = newValue
}

export function setVolumeArray(newVolumeArray: number[]) {
    VolumeArray = newVolumeArray
    // console.log(Volumerray)
}

export function setByType(drumSet: DrumSet, newValue: number) {
    const drumTypeKey = drumSet.type as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    VolumeArray[index] = newValue;
}
export function setByIndex(index: number, newValue: number) {
    VolumeArray[index] = newValue
}

export function setVolumesBySpan(new_volumeBySpan: number[][]) {
    VolumesBySpan = new_volumeBySpan
    console.log("VolumesBySpan remappé")
    // console.log(VolumesBySpan)
}
export function setSpanVolume(i: number, j: number, new_volume: number) {
    VolumesBySpan[i][j] = new_volume
    // console.log("VolumesBySpan " + i + j + "est mis à jour à la valeur :" + new_volume)
}

