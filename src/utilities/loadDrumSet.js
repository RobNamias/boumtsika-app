import num_Drum_Kit from '../utilities/setDrumSet';
// const audioFiles require.context("../assets/audio/drumKits/808/", false, /.mp3$/);
var audioFiles = [];


console.log("le num Drum Kit à l'entrée de loadDrumSet : ", num_Drum_Kit);
if (num_Drum_Kit === "808") {
    audioFiles = require.context("../assets/audio/drumKits/808/", false, /.mp3$/);
}
else if (num_Drum_Kit === "909") {
    audioFiles = require.context("../assets/audio/drumKits/909/", false, /.mp3$/);
}
var idDossier = "./" + num_Drum_Kit + " - ";
const drumKit_sounds = audioFiles.keys().map((file) => ({
    type: file.replace(idDossier, "").replace(".mp3", ""), // Extract filename without extension
    sound: audioFiles(file),
}));
console.log(drumKit_sounds[0].type)

const drumTypes = [
    {
        type: drumKit_sounds[0].type,
        sound: drumKit_sounds[0].sound
    },
    {
        type: drumKit_sounds[1].type,
        sound: drumKit_sounds[1].sound
    },
    {
        type: drumKit_sounds[2].type,
        sound: drumKit_sounds[2].sound
    },
    {
        type: drumKit_sounds[3].type,
        sound: drumKit_sounds[3].sound
    },
];
export default drumTypes
