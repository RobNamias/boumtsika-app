//Delay

import { dataDelay } from "../models/Delay"

const initialDelayArray: dataDelay[] = []

for (let i = 0; i < 5; i++) {
    var newDelay: dataDelay = { step: 2, feedback: 2, inputVolume: 80, is_active: false }
    initialDelayArray.push(newDelay)
}

export var DelayArray = initialDelayArray

export function setDelay(newDelayArray: dataDelay[]) {
    DelayArray = newDelayArray
}
export function setStepDelay(newValue: number, drumTypeIndex: number) {
    DelayArray[drumTypeIndex].step = newValue
}

export function setFeedbackDelay(newValue: number, drumTypeIndex: number) {
    DelayArray[drumTypeIndex].feedback = newValue
}
export function setInputVolumeDelay(newValue: number, drumTypeIndex: number) {
    DelayArray[drumTypeIndex].inputVolume = newValue
}

export function setIsActiveDelay(newValue: boolean, drumTypeIndex: number) {
    DelayArray[drumTypeIndex].is_active = newValue
}