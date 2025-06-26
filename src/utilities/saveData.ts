import { DrumSet } from "../models/DrumSet";
// import { dataDelay } from "../models/Delay"
import { VolumeArray } from "./volumesManager";
import { PatternArray } from '../utilities/patternManager';
import { VolumesBySpan } from "./volumesManager";
import { DelayArray } from '../utilities/delayManager';
import { FillArray } from '../utilities/fillManager';

export function saveDataToFile(drumSet: DrumSet[], bpm: number,) {

    //On réactive toutes les pistes pour la sauvegarde, par convention personnelle
    const setDrumSet = drumSet
    for (let i = 0; i < setDrumSet.length; i++) {
        setDrumSet[i].is_active = true
    }


    let Data = {
        setDrumSet,
        bpm,
        VolumeArray,
        PatternArray,
        VolumesBySpan,
        DelayArray,
        FillArray

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