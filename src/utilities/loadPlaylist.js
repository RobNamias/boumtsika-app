
var num_drum_kit = "808";
// const audioFiles require.context("../assets/audio/drumKits/808/", false, /.mp3$/);

// if (num_drum_kit === "808") {
const audioFiles = require.context("../assets/audio/drumKits/808/", false, /.mp3$/);
// }
console.log(num_drum_kit);
const drumKit_sounds = audioFiles.keys().map((file) => ({
    type: file.replace("./808 - ", "").replace(".mp3", ""), // Extract filename without extension
    sound: audioFiles(file),
}));

export default drumKit_sounds;

