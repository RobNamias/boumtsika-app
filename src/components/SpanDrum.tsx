import React from 'react';
import * as Pattern from '../utilities/patternManager';

type Props = {
    drumType: string;
    index: number
};


const setSpan = (event: React.MouseEvent) => {
    const drumType = event?.currentTarget?.className.replace('sdd_', '').replace('span_drum_div', '').replace('sdd_', '').replace((parseInt(event?.currentTarget?.classList[2].replace("sdd_", "")).toString()), "").replace(' ', '').replace(' ', '');
    var drumTypeIndex: number = 0
    switch (drumType) {
        case 'Kick':
            drumTypeIndex = 0;
            break;
        case 'Snare':
            drumTypeIndex = 1;
            break;
        case 'ClHat':
            drumTypeIndex = 2;
            break;
        case 'OpHat':
            drumTypeIndex = 3;
            break;
        case 'Crash':
            drumTypeIndex = 4;
            break;
        default:
            break
    }
    const classList = event?.currentTarget?.children[0].classList;
    const j = parseInt(event?.currentTarget?.classList[2].replace("sdd_", "")) - 1
    classList.contains("span_active") ? classList.remove("span_active") : classList.add("span_active")
    Pattern.setSpanActive(drumTypeIndex, j + (Pattern.numeroPage - 1) * 16, classList.contains("span_active"))
    // console.log(Pattern.PatternArray[drumTypeIndex][j + (Pattern.numeroPage - 1) * 16]);
}



const SpanDrum: React.FC<Props> = (drumType) => {
    return (
        <>
            <div className={'span_drum_div sdd_' + drumType.drumType + ' sdd_' + drumType.index} id={'sdd_' + drumType.index} onClick={setSpan}>
                <span className={'span_drum span_' + drumType.index} id={drumType.drumType + '_' + drumType.index} ></span>
            </div>
        </>
    );
};


export default SpanDrum;

