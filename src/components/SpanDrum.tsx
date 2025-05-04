import React from 'react';
import * as Pattern from '../utilities/patternManager';

const setSpan = (event: React.MouseEvent) => {
    var i: number = 0
    switch (event?.currentTarget?.classList[1].replace("sdd_", "")) {
        case "Kick":
            i = 0
            break;
        case "Snare":
            i = 1
            break;
        case "ClHat":
            i = 2
            break;
        case "OpHat":
            i = 3
            break;
        case "Crash":
            i = 4
            break;
    }
    const classList = event?.currentTarget?.children[0].classList;
    const j = parseInt(event?.currentTarget?.classList[2].replace("sdd_", "")) - 1
    switch (classList.contains("span_active")) {
        case true: {
            classList.remove("span_active");
            Pattern.setSpanActive(i, j, false)
            break;
        }
        case false: {
            classList.add("span_active");
            Pattern.setSpanActive(i, j, true)
            break;
        }
        default: {
            console.log("La séléction de Span ne marche pas")
            break;
        }
    }
    // console.log(getPattern());
}

type Props = {
    drumType: string;
    index: number
};

const SpanDrum: React.FC<Props> = (drumType) => {
    return (
        <div className={'span_drum_div sdd_' + drumType.drumType + ' sdd_' + drumType.index} id={'sdd_' + drumType.index} onClick={setSpan}>
            <span className={'span_drum span_' + drumType.index} id={drumType.drumType + '_' + drumType.index} ></span>
        </div>
    );
};


export default SpanDrum;