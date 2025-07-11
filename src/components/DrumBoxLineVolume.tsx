import React, { useEffect, ChangeEvent } from 'react';
// import * as Volumes from '../utilities/volumesManager';
import { Pattern, Volumes } from '../utilities/';

type Props = {
    drumType: string;
    index: number;
    page: number; // <-- Ajoute cette prop
    degreesOfGroove: number[];
    setDegreesOfGroove: (v: number[]) => void;
    setLocalVolumesBySpan: (v: number[][]) => void;
    localVolumesBySpan: number[];
    volumesRefreshKey: number;
};

const DrumBoxLineVolume: React.FC<Props> = ({
    drumType, index, page, degreesOfGroove, setDegreesOfGroove, setLocalVolumesBySpan, localVolumesBySpan, volumesRefreshKey
}) => {
    const pageOffset = (page - 1) * 16;
    const indexes = Array.from({ length: 16 }, (_, i) => i + 1);

    const changeGroove = (event: ChangeEvent<HTMLInputElement>) => {
        Volumes.setDegOfGrooveByIndex(index, parseInt(event.currentTarget.value));
        setDegreesOfGroove([...Volumes.DegreesOfGroove]);
    };

    // Synchronise les volumes à chaque changement de page
    useEffect(() => {
        setLocalVolumesBySpan([...Volumes.VolumesBySpan]);
    }, [page, setLocalVolumesBySpan, volumesRefreshKey]);

    const createGroove = () => {
        const newVolumeBySpanArray: number[] = [];
        for (let j = 0; j < Pattern.patternLength; j++) {
            const deg = degreesOfGroove[index];
            const newValue = Math.random() < 0.5
                ? 50 + Math.random() * 10 * deg
                : 50 - Math.random() * 10 * deg;
            newVolumeBySpanArray.push(newValue);
        }
        Volumes.VolumesBySpan[index] = newVolumeBySpanArray;
        setLocalVolumesBySpan([...Volumes.VolumesBySpan]);
    };

    const returnGroove = () => {
        let labelGroove = 'Groo';
        for (let i = 0; i < degreesOfGroove[index]; i++) labelGroove += "o";
        labelGroove += "ve";
        return labelGroove;
    };

    const setSpanVolume = (event: ChangeEvent<HTMLInputElement>) => {
        const e = event.currentTarget;
        const idx = parseInt(e.id); // idx = 1 à 16
        Volumes.setSpanVolume(index, pageOffset + idx - 1, Number(e.value));
        setLocalVolumesBySpan([...Volumes.VolumesBySpan]);
    };


    return (
        <div className={"layer dbl_volume " + drumType + "_layer"} id={"card" + drumType + "_layer_volume"}>
            <div className="container_setGroove">
                <div className='container_input_setter_groove'>
                    <input
                        type="range"
                        className='setters_Groove'
                        id={"setter_Groove_" + index}
                        name={"setter_Groove_" + index}
                        onChange={changeGroove}
                        min={0}
                        max={5}
                        step={1}
                        list="markers"
                    />
                    <datalist id="markers">
                        {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v} label={v.toString()} />)}
                    </datalist>
                </div>
                <input
                    type="submit"
                    className='button_menu setters_Groove_submit'
                    id={"setter_Groove_submit_" + index}
                    value={returnGroove()}
                    onClick={createGroove}
                />
            </div>
            {indexes.map(idx => (
                <div key={idx} className={'vertical-wrapper spanVolume spanVolume' + idx} id={idx + "_vol_" + drumType}>
                    <input
                        type="range"
                        className='vertical spanVolumeInput'
                        id={idx + "_vol" + drumType}
                        step="5"
                        value={localVolumesBySpan[pageOffset + idx - 1]} // <-- Décalage ici
                        onChange={setSpanVolume}
                    />
                </div>
            ))}
        </div>
    );
};

export default DrumBoxLineVolume;