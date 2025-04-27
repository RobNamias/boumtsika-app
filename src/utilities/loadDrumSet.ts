import { DrumType } from "../models/DrumType";

var audioFiles: __WebpackModuleApi.RequireContext;

export function switchDrumSet(numDrumKit: string, volumeSoundArray: number[]) {
    switch (numDrumKit) {
        case "707":
            audioFiles = require.context("../assets/audio/drumKits/707/", false, /.ogg$/);
            break;
        case "808":
            audioFiles = require.context("../assets/audio/drumKits/808/", false, /.ogg$/);
            break;
        case "909":
            audioFiles = require.context("../assets/audio/drumKits/909/", false, /.ogg$/);
            break;
        case "Tribe":
            audioFiles = require.context("../assets/audio/drumKits/Tribe/", false, /.ogg$/);
            break;
        default:
            audioFiles = require.context("../assets/audio/drumKits/808/", false, /.ogg$/);
            break;
    }

    var idDossier = "./" + numDrumKit + " - ";

    var drumSet = audioFiles.keys().map((file) => ({
        type: file.replace(idDossier, "").replace(" ", "").replace(".ogg", "") as keyof typeof DrumType, // Extract filename without extension
        drumKit: numDrumKit,
        path: audioFiles(file),
        audio: new Audio(audioFiles(file)),
        volume: 0.5,
        pattern: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
            false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }));

    // Réorganisation du tableau pour avoir un ordre plus logique que l'ordre alphabetique
    var drum_temp = drumSet[0];
    drumSet[0] = drumSet[2];
    drumSet[2] = drum_temp;
    drum_temp = drumSet[1];
    drumSet[1] = drumSet[4];
    drumSet[4] = drum_temp;

    // console.log(drumSet);
    for (let i = 0; i < drumSet.length; i++) {
        drumSet[i].volume = volumeSoundArray[i]
    }
    return drumSet;
}
