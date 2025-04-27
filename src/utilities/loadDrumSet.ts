import { DrumType } from "../models/DrumType";

var audioFiles: __WebpackModuleApi.RequireContext;

export function switchDrumSet(numDrumKit: string) {
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
        path: audioFiles(file),
        audio: new Audio(audioFiles(file)),
        volume: 0.5
    }));

    // Réorganisation du tableau pour avoir un ordre plus logique que l'ordre alphabetique
    var drum_temp = drumSet[0];
    drumSet[0] = drumSet[2];
    drumSet[2] = drum_temp;
    drum_temp = drumSet[1];
    drumSet[1] = drumSet[4];
    drumSet[4] = drum_temp;

    // console.log(drumSet);

    return drumSet;
}
