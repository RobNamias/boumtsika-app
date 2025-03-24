import React from 'react';

const setSpan = (event: React.MouseEvent) => {
    const classList = event?.currentTarget?.children[0].classList;
    console.log(classList.length)
    console.log(event?.currentTarget?.classList)

    switch (classList.contains("drum_active")) {
        case false: {
            classList.add("drum_active");
            break;
        }
        case true: {
            classList.remove("drum_active");
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
};

const SpanDrum: React.FC<Props> = (drumType) => {
    return (
        <div className={'span_drum_div ' + drumType} onClick={setSpan}>
            {/* <div className='span_drum_div' onClick={setSpan}> */}
            <span className={'span_drum span_' + drumType} id={drumType + '_(x/16)'} ></span>
        </div>
    );
};


export default SpanDrum;