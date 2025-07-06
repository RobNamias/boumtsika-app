import React, { ChangeEvent } from 'react';
import * as Volumes from '../utilities/volumesManager';

type Props = {
    drumType: string;
    index: number;
    degreesOfGroove: number[];
    setDegreesOfGroove: (v: number[]) => void;
    setLocalVolumesBySpan: (v: number[][]) => void;
};

const DrumBoxLineVolume: React.FC<Props> = ({
    drumType, index, degreesOfGroove, setDegreesOfGroove, setLocalVolumesBySpan
}) => {
    const indexes = Array.from({ length: 16 }, (_, i) => i + 1);

    const changeGroove = (event: ChangeEvent<HTMLInputElement>) => {
        Volumes.setDegOfGrooveByIndex(index, parseInt(event.currentTarget.value));
        setDegreesOfGroove([...Volumes.DegreesOfGroove]);
    };

    const createGroove = () => {
        const newVolumeBySpanArray: number[] = [];
        for (let j = 0; j < 32; j++) {
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
        const idx = parseInt(e.id);
        Volumes.setSpanVolume(index, idx - 1, Number(e.value));
        setLocalVolumesBySpan([...Volumes.VolumesBySpan]);
    };

    return (
        <div className={"dbl_volume layer card" + drumType + "_layer layer_volume current_layer"} id={"card" + drumType + "_layer_volume"}>
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
                <div className={'vertical-wrapper spanVolume spanVolume' + idx} key={idx}>
                    <input
                        type="range"
                        className='vertical spanVolumeInput'
                        id={idx + "_vol" + drumType}
                        step="5"
                        value={Volumes.VolumesBySpan[index][idx - 1]}
                        onChange={setSpanVolume}
                    />
                    {idx % 4 === 0 && idx < 16 && <div className={"separation sep_" + idx / 4} />}
                </div>
            ))}
        </div>
    );
};

export default DrumBoxLineVolume;