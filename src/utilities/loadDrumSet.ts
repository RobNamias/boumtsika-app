var audioFiles: __WebpackModuleApi.RequireContext;

export function switchDrumSet(numDrumKit: string) {
    //     console.log("le num Drum Kit à l'entrée de loadDrumSet : ", numDrumKit);
    switch (numDrumKit) {
        case "707":
            audioFiles = require.context("../assets/audio/drumKits/707/", false, /.mp3$/);
            break;
        case "808":
            audioFiles = require.context("../assets/audio/drumKits/808/", false, /.mp3$/);
            break;
        case "909":
            audioFiles = require.context("../assets/audio/drumKits/909/", false, /.mp3$/);
            break;
        default:
            audioFiles = require.context("../assets/audio/drumKits/808/", false, /.mp3$/);
            break;
    }

    var idDossier = "./" + numDrumKit + " - ";

    var drumSet = audioFiles.keys().map((file) => ({
        type: file.replace(idDossier, "").replace(" ", "").replace(".mp3", ""), // Extract filename without extension
        sound: audioFiles(file)
    }));

    // console.log(drumSet);

    return drumSet;
}
