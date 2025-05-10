
import React, { ChangeEvent, useState } from 'react';
import SpanDrum from "./SpanDrum";
import { getValue } from '@testing-library/user-event/dist/utils';
import { DrumType } from '../models/DrumType';
import * as Volumes from '../utilities/volumesManager'

type Props = {
    drumType: string;
    index: number;
};

const DrumBoxLine: React.FC<Props> = (drumType) => {
    let indexes: number[] = [];
    let i: number;
    for (i = 1; i <= 32; i++) {
        indexes.push(i);
    }

    const [localVolumesBySpan, setLocalVolumesBySpan] = useState(Volumes.VolumesBySpan);
    const [degreesOfGroove, setDegreesOfGroove] = useState(Volumes.DegreesOfGroove)

    const createGroove = (e: React.MouseEvent<HTMLInputElement>) => {
        const indexDrumType = parseInt(e.currentTarget.id.replace("setter_Groove_submit_", ""))
        const newVolumeBySpanArray: number[] = []
        for (let j = 0; j < 32; j++) {
            if (Math.random() < 0.5) {
                newVolumeBySpanArray.push(50 + Math.random() * 10 * degreesOfGroove[indexDrumType]);
            }
            else {
                newVolumeBySpanArray.push(50 - Math.random() * 10 * degreesOfGroove[indexDrumType]);
            }
        }
        Volumes.VolumesBySpan[indexDrumType] = newVolumeBySpanArray// setLocalVolumes([...Volumes.VolumeArray]);
        setLocalVolumesBySpan([...Volumes.VolumesBySpan])
    }

    const changeGroove = (event: ChangeEvent<HTMLInputElement>) => {
        Volumes.setDegOfGrooveByIndex(parseInt(event.currentTarget.id.replace("setter_Groove_", "")), parseInt(event?.currentTarget.value))
        setDegreesOfGroove([...Volumes.DegreesOfGroove])
    }

    const returnGroove = (indexDrumType: number) => {
        var labelGroove = 'Groo'
        for (let i = 0; i < degreesOfGroove[indexDrumType]; i++) {
            labelGroove += "o"
        }
        labelGroove += "ve"
        return labelGroove
    }
    const setSpanVolume = (event: ChangeEvent<HTMLInputElement>) => {
        const e = event?.currentTarget;
        const index = parseInt(e.id)
        const id = e.id.replace(index.toString() + "_vol", "");
        // console.log(index)
        // console.log(id)
        const drumTypeKey = id as keyof typeof DrumType;
        const indexDrum = DrumType[drumTypeKey];
        Volumes.setSpanVolume(indexDrum, index - 1, Number(getValue(e)));
        setLocalVolumesBySpan([...Volumes.VolumesBySpan]);
        // console.log(localVolumesBySpan[indexDrum])
    };


    return (
        <>
            <div className='drum_box_line' id={'dbl_' + drumType.drumType}>
                <div className="dbl_volume" id={'dbl_volume_' + drumType.drumType}>
                    <div className="container_setGroove">
                        <div className='container_input_setter_groove'>
                            {/* 
                            <label htmlFor="setter_Groove">Groove :</label> */}
                            <div>
                                <input
                                    type="range"
                                    className='setters_Groove'
                                    id={"setter_Groove_" + drumType.index}
                                    name={"setter_Groove_" + drumType.index}
                                    onChange={changeGroove}
                                    min={0}
                                    max={5}
                                    step={1}
                                    list="markers"
                                />
                                <datalist id="markers">
                                    <option value="0" label="0"></option>
                                    <option value="1" label="1"></option>
                                    <option value="2" label="2"></option>
                                    <option value="3" label="3"></option>
                                    <option value="4" label="4"></option>
                                    <option value="5" label="5"></option>
                                </datalist>
                            </div>
                        </div>
                        <input type="submit" className='button_menu setters_Groove_submit' id={"setter_Groove_submit_" + drumType.index}
                            value={returnGroove(drumType.index)} onClick={createGroove}></input>
                    </div>
                    {indexes.map(index => (
                        <>
                            <div className={'vertical-wrapper spanVolume spanVolume' + index}>
                                <input
                                    type="range"
                                    className='vertical spanVolumeInput'
                                    id={index + "_vol" + drumType.drumType}
                                    step="5"
                                    value={localVolumesBySpan[drumType.index][index - 1]}
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


