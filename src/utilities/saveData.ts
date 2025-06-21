import { DrumSet } from "../models/DrumSet";
import { dataDelay } from "../models/Delay"

export function saveDataToFile(drumSet: DrumSet[], bpm: number, volumeSoundArray: number[], patternArray: boolean[][], volumesBySpan: number[][], delayArray: dataDelay[]) {

    const setDrumSet = drumSet
    for (let i = 0; i < setDrumSet.length; i++) {
        setDrumSet[i].is_active = true
    }


    let Data = {
        setDrumSet,
        bpm,
        volumeSoundArray,
        patternArray,
        volumesBySpan,
        delayArray
    };

    let jsonData = JSON.stringify(Data, null, 2);
    let blob = new Blob([jsonData], { type: "application/json" });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `PoumTsiKa_save.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log(`💾 Sauvegarde exportée : ${a.download}`);
}