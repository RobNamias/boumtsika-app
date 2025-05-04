import { DrumSet } from "../models/DrumSet"
import { DrumType } from "../models/DrumType"

const initialVolumeArray: number[] = [50, 50, 50, 50, 50]
const initialVolumesBySpan: number[][] = [[], [], [], [], []]

for (let i = 0; i < initialVolumesBySpan.length; i++) {
    for (let j = 0; j < 32; j++) {
        initialVolumesBySpan[i].push(50 + Math.random() * 50);
    }
}


export var VolumeArray = initialVolumeArray
export var VolumesBySpan = initialVolumesBySpan

export function set(newVolumeArray: number[]) {
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


export function get() {
    return VolumeArray;
}
export function getByType(drumSet: DrumSet) {
    const drumTypeKey = drumSet.type as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    return VolumeArray[index];
}
export function getByIndex(index: number) {
    return VolumeArray[index];
}


export function setSpanVolume(i: number, j: number, new_volume: number) {
    VolumesBySpan[i][j] = new_volume
}
export function getVolumesBySpan() {
    return VolumesBySpan
}