import { patternLength } from "./patternManager"

const initialFillArray: number[][] = [[], [], [], [], []]

for (let i = 0; i < 5; i++) {
    for (let j = 0; j < patternLength; j++) {
        initialFillArray[i].push(1)
    }
}

export var FillArray: number[][] = initialFillArray

export function setFillArray(newFillArray: number[][]) {
    FillArray = newFillArray
}

export function setBySpan(newValue: number, drumTypeIndex: number, timeIndex: number) {
    FillArray[drumTypeIndex][timeIndex] = newValue
}