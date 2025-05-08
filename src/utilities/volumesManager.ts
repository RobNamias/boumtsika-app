import { DrumSet } from "../models/DrumSet"
import { DrumType } from "../models/DrumType"

const initialVolumeArray: number[] = [50, 50, 50, 50, 50]
const initialVolumesBySpan: number[][] = [[], [], [], [], []]

for (let i = 0; i < initialVolumesBySpan.length; i++) {
    for (let j = 0; j < 32; j++) {
        initialVolumesBySpan[i].push(50);
        // initialVolumesBySpan[i].push(Math.random() * 100);
    }
}


export var VolumeArray = initialVolumeArray
export var VolumesBySpan = initialVolumesBySpan

export function set(newVolumeArray: number[]) {
    VolumeArray = newVolumeArray
    // console.log(Volumerray)
}

export function generateAleaArray(degreeOfGroove: number) {
    var newVolumeBySpanArray: number[][] = [[], [], [], [], []]
    for (let i = 0; i < newVolumeBySpanArray.length; i++) {
        for (let j = 0; j < 32; j++) {
            newVolumeBySpanArray[i].push(40 + Math.random() * 12 * degreeOfGroove);
        }
    }
    return newVolumeBySpanArray
}
export function setByType(drumSet: DrumSet, newValue: number) {
    const drumTypeKey = drumSet.type as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    VolumeArray[index] = newValue;
}
export function setByIndex(index: number, newValue: number) {
    VolumeArray[index] = newValue
}


export function getByType(drumSet: DrumSet) {
    const drumTypeKey = drumSet.type as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    return VolumeArray[index];
}

export function setVolumesBySpan(new_volumeBySpan: number[][]) {
    VolumesBySpan = new_volumeBySpan
    console.log("VolumesBySpan remappé")
    console.log(VolumesBySpan)
}
export function setSpanVolume(i: number, j: number, new_volume: number) {
    VolumesBySpan[i][j] = new_volume
    // console.log("VolumesBySpan " + i + j + "est mis à jour à la valeur :" + new_volume)
}
export function getSpanVolume(i: number, j: number) {
    return VolumesBySpan[i][j]
}
