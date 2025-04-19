
import React from "react";
import SpanDrum from "./SpanDrum";
// import { useEffect, useState } from "react";

type Props = {
    drumType: string;
};


const DrumBoxLine: React.FC<Props> = (drumType) => {
    let indexes: number[] = [];
    let i: number;
    for (i = 1; i <= 32; i++) {
        indexes.push(i);
    }

    return (
        <div className={'drum_box_line dbl_' + drumType.drumType}>
            {indexes.map(index => (
                <>
                    <SpanDrum
                        drumType={drumType.drumType}
                        index={index}
                    />
                    {/* affichage conditionnel */}
                    {index % 4 === 0 && index < 32 && <div className={"separation sep_" + index / 4}></div>}
                </>
            ))
            }
        </div >
    )
};


export default DrumBoxLine;