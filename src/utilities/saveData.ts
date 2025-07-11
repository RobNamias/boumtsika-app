import { DrumSet } from "../models/DrumSet";
import { VolumeArray, VolumesBySpan } from "./volumesManager";
import { PatternArray } from '../utilities/patternManager';
import { DelayArray } from '../utilities/delayManager';
import { FillArray } from '../utilities/fillManager';

/**
 * Sauvegarde les données essentielles de l'app dans un fichier JSON.
 * Seules les infos nécessaires à la restitution du pattern, du kit, des volumes, delays et fills sont exportées.
 */
export function saveDataToFile(drumSet: DrumSet[], bpm: number) {
    // On ne garde que les propriétés utiles de chaque drum
    const minimalDrumSet = drumSet.map(drum => ({
        type: drum.type,
        drumKit: drum.drumKit,
        path: drum.path,
        is_active: drum.is_active ?? true
    }));

    const Data = {
        setDrumSet: minimalDrumSet,
        bpm,
        VolumeArray,
        VolumesBySpan,
        PatternArray,
        DelayArray,
        FillArray
    };

    const jsonData = JSON.stringify(Data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `PoumTsiKa_save.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log(`💾 Sauvegarde exportée : ${a.download}`);
}