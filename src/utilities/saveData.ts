import { DrumSet } from "../models/DrumSet";

export function saveDataToFile(drumSet: DrumSet[], bpm: number, volumeSoundArray: number[], patternArray: boolean[][], VolumesBySpan: number[][]) {
    let Data = {
        drumSet,
        bpm,
        volumeSoundArray,
        patternArray,
        VolumesBySpan
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