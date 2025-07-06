import React from 'react';
import * as Pattern from '../utilities/patternManager';
import { DrumType } from '../models/DrumType';

type Props = {
    drumType: string;
    index: number;
};

const DrumBoxLineAutocomplete: React.FC<Props> = ({ drumType, index }) => {
    const autoComplete = (drumTypeStr: string) => {
        const buttons = document.getElementsByName(drumTypeStr + "nb_autocomplete");
        let valeur;
        for (let i = 0; i < buttons.length; i++) {
            const htmlButton = buttons[i] as HTMLInputElement;
            if (htmlButton.checked) {
                valeur = htmlButton.value;
            }
        }
        const drumTypeKey = drumTypeStr as keyof typeof DrumType;
        if (valeur) {
            Pattern.autoCompleteByIndex(DrumType[drumTypeKey], valeur);
        }
        const listSpanByDrum = document.getElementsByClassName("sdd_" + drumTypeStr);
        for (let j = 0; j < Pattern.PatternArray[DrumType[drumTypeKey]].length; j++) {
            Pattern.PatternArray[DrumType[drumTypeKey]][j]
                ? listSpanByDrum[j]?.children[0].classList.add("span_active")
                : listSpanByDrum[j]?.children[0].classList.remove("span_active");
        }
    };

    return (
        <div className={"dbl_autocomplete layer card" + drumType + "_layer layer_autocomplete"} id={"card" + drumType + "_layer_autocomplete"}>
            <fieldset className='autocomplete_container'>
                <legend>Auto-complete</legend>
                {[1, 2, 4, 'random'].map(val => (
                    <div key={val}>
                        <input type="radio" id={drumType + "ac_" + val} name={drumType + "nb_autocomplete"} value={val} />
                        <label htmlFor={drumType + "ac_" + val}>{val}</label>
                    </div>
                ))}
            </fieldset>
            <input
                type="submit"
                className='button_menu autocomplete_submit'
                id={"autocomplete_submit_" + index}
                value="Complete"
                onClick={() => autoComplete(drumType)}
            />
        </div>
    );
};

export default DrumBoxLineAutocomplete;