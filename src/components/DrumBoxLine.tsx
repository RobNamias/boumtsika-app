
import React, { ChangeEvent, useState } from 'react';
import SpanDrum from "./SpanDrum";
import { getValue } from '@testing-library/user-event/dist/utils';
import { DrumType } from '../models/DrumType';
import * as Volumes from '../utilities/volumesManager'

type Props = {
    drumType: string;
    index: number;
};

// export function set_DBL_LocalVolumesBySpan(new_LocalVolumesBySpan: number[][]) {
//     Volumes.setVolumesBySpan(new_LocalVolumesBySpan)
//     console.log(Volumes.VolumesBySpan)
// }

const DrumBoxLine: React.FC<Props> = (drumType) => {
    let indexes: number[] = [];
    let i: number;
    for (i = 1; i <= 32; i++) {
        indexes.push(i);
    }

    const [localVolumesBySpan, setLocalVolumesBySpan] = useState(Volumes.VolumesBySpan);

    const setSpanVolume = (event: ChangeEvent<HTMLInputElement>) => {
        const e = event?.currentTarget;
        const index = parseInt(e.id)
        const id = e.id.replace(index.toString() + "_vol", "");
        // console.log(index)
        // console.log(id)
        const drumTypeKey = id as keyof typeof DrumType;
        const indexDrum = DrumType[drumTypeKey];
        // console.log(indexDrum + " " + (index - 1) + " " + Number(getValue(e)));
        Volumes.setSpanVolume(indexDrum, index - 1, Number(getValue(e)));
        setLocalVolumesBySpan([...Volumes.VolumesBySpan]);
        // console.log(localVolumesBySpan[indexDrum])
    };


    return (
        <>
            <div className='drum_box_line' id={'dbl_' + drumType.drumType}>
                <div className="dbl_volume" id={'dbl_volume_' + drumType.drumType}>
                    {indexes.map(index => (
                        <>
                            <div className={'vertical-wrapper spanVolume spanVolume' + index}>
                                <input
                                    type="range"
                                    className='vertical spanVolumeInput'
                                    id={index + "_vol" + drumType.drumType}
                                    step="5"
                                    value={Volumes.VolumesBySpan[drumType.index][index - 1]}
                                    onChange={setSpanVolume}
                                />
                            </div>
                            {/* {index % 4 === 0 && index < 32 && <div className={"separation sep_" + index / 4}></div>} */}
                        </>
                    ))

                    }
                </div >
                {
                    indexes.map(index => (
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
        </>
    )
};


export default DrumBoxLine;


