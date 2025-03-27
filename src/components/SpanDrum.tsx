import React from 'react';

const setSpan = (event: React.MouseEvent) => {
    const classList = event?.currentTarget?.children[0].classList;
    console.log(event?.currentTarget?.children[0].id)

    switch (classList.contains("span_active")) {
        case false: {
            classList.add("span_active");
            break;
        }
        case true: {
            classList.remove("span_active");
            break;
        }
        default: {
            console.log("ça fait queud")
            break;
        }
    }
    console.log(classList);
}

type Props = {
    drumType: string;
    index: number
};

const SpanDrum: React.FC<Props> = (drumType) => {
    return (
        <div className={'span_drum_div sdd_' + drumType.drumType} id={'sdd_' + drumType.index} onClick={setSpan}>
            <span className={'span_drum span_' + drumType.index} id={drumType.drumType + '_' + drumType.index} ></span>
        </div>
    );
};


export default SpanDrum;