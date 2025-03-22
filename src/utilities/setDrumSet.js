var num_Drum_Kit = "808";

export function setDrumSet(string) //je récupère le string via mon onclick sur les bouton du menu.
{
    num_Drum_Kit = string;
    console.log("num_Drum_kit dans ma fonction setDrumSet : ", num_Drum_Kit);
}
export default (num_Drum_Kit);
