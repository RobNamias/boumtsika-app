import num_Drum_Kit from './setDrumSet';
// const audioFiles require.context("../assets/audio/drumKits/808/", false, /.mp3$/);
var audioFiles: __WebpackModuleApi.RequireContext;


console.log("le num Drum Kit à l'entrée de loadDrumSet : ", num_Drum_Kit);
switch (num_Drum_Kit) {
    case "808":
        audioFiles = require.context("../assets/audio/drumKits/808/", false, /.mp3$/);
        break;
    case "909":
        audioFiles = require.context("../assets/audio/drumKits/909/", false, /.mp3$/);
        break;
    default: audioFiles = require.context("../assets/audio/drumKits/808/", false, /.mp3$/);
        break;
}

var idDossier = "./" + num_Drum_Kit + " - ";
// const drumKit_sounds = audioFiles.keys().map((file) => ({
//     type: file.replace(idDossier, "").replace(".mp3", ""), // Extract filename without extension
//     sound: audioFiles(file),
// }));
interface DrumSet {
    type: string;
    sound: string;
}
const drumSet: DrumSet[] = audioFiles.keys().map((file) => ({
    type: file.replace(idDossier, "").replace(".mp3", ""), // Extract filename without extension
    sound: audioFiles(file),
}));

// const drumSet = [
//     {
//         type: drumKit_sounds[0].type,
//         sound: drumKit_sounds[0].sound
//     },
//     {
//         type: drumKit_sounds[1].type,
//         sound: drumKit_sounds[1].sound
//     },
//     {
//         type: drumKit_sounds[2].type,
//         sound: drumKit_sounds[2].sound
//     },
//     {
//         type: drumKit_sounds[3].type,
//         sound: drumKit_sounds[3].sound
//     },
// ];
export default drumSet
