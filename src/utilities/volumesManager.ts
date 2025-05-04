import { DrumSet } from "../models/DrumSet"
import { DrumType } from "../models/DrumType"

const initialVolumeArray: number[] = [50, 50, 50, 50, 50]


export var VolumeArray = initialVolumeArray

export function setByIndex(index: number, newValue: number) {
    VolumeArray[index] = newValue
}
export function set(newVolumeArray: number[]) {
    VolumeArray = newVolumeArray
    // console.log(PatternArray)
}

export function get() {
    return VolumeArray;
}
export function getByIndex(index: number) {
    return VolumeArray[index];
}
export function getByType(drumSet: DrumSet) {
    const drumTypeKey = drumSet.type as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    return VolumeArray[index];
}
export function setByType(drumSet: DrumSet, newValue: number) {
    const drumTypeKey = drumSet.type as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    VolumeArray[index] = newValue;
}