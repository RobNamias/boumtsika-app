/**
 * Active/désactive le solo sur une piste de drum.
 * @param drums - tableau des drums
 * @param drumTypeKey - clé du drum (ex: "Kick")
 * @param button - élément HTML du bouton solo
*/
export function switchMuted(drums: any[], drumTypeKey: string) {
    const index = drums.findIndex(drum => drum.type === drumTypeKey);
    if (index === -1) return;
    const muteId = "mute_" + drums[index].type;
    const isMuted = drums[index].is_active;
    toggle_classes(muteId, "is_muted", isMuted);
    drums[index].is_active = !isMuted;
}

export function switchSolo(drums: any[], drumTypeKey: string, button: HTMLElement) {
    const index = drums.findIndex(drum => drum.type === drumTypeKey);
    if (!button.classList.contains("is_solo")) {
        button.classList.add("is_solo");
        for (let i = 0; i < drums.length; i++) {
            toggle_classes("mute_" + drums[i].type, "is_muted", i !== index);
            toggle_classes("solo_" + drums[i].type, "is_solo", i === index);
            drums[i].is_active = i === index;
        }
    } else {
        button.classList.remove("is_solo");
        for (let i = 0; i < drums.length; i++) {
            drums[i].is_active = true;
            document.getElementById("mute_" + drums[i].type)?.classList.remove("is_muted");
        }
    }
}

/**
 * Ajoute ou retire une classe sur un élément selon l'état.
 */
export function toggle_classes(id: string, className: string, shouldBeActivated: boolean = true) {
    const el = document.getElementById(id);
    if (!el) return;
    shouldBeActivated ? el.classList.add(className) : el.classList.remove(className);
}


//Affichage des options
export function drumFunction(drumType: string) {
    const isActivated = document.getElementById("co_" + drumType)?.classList.contains("container_option_active")
    toggle_classes("co_" + drumType, "container_option_active", !isActivated)
}
