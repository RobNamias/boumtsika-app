import React, { ChangeEvent } from 'react';
import * as Delay from '../utilities/delayManager';

type Props = {
    drumType: string;
    index: number;
    localDataDelay: typeof Delay.DelayArray;
    setLocalDataDelay: (v: typeof Delay.DelayArray) => void;
};

const DrumBoxLineDelay: React.FC<Props> = ({
    drumType, index, localDataDelay, setLocalDataDelay
}) => {
    const changeStepDelay = (e: ChangeEvent<HTMLInputElement>) => {
        Delay.setStepDelay(parseInt(e.currentTarget.value), index);
        setLocalDataDelay([...Delay.DelayArray]);
    };
    const changeFeedbackDelay = (e: ChangeEvent<HTMLInputElement>) => {
        Delay.setFeedbackDelay(parseInt(e.currentTarget.value), index);
        setLocalDataDelay([...Delay.DelayArray]);
    };
    const changeInputVolumeDelay = (e: ChangeEvent<HTMLInputElement>) => {
        Delay.setInputVolumeDelay(parseInt(e.currentTarget.value), index);
        setLocalDataDelay([...Delay.DelayArray]);
    };
    const switchIsActiveDelay = (newValue: boolean) => {
        Delay.setIsActiveDelay(newValue, index);
        setLocalDataDelay([...Delay.DelayArray]);
    };

    return (
        <div className={"dbl_delay layer card" + drumType + "_layer layer_delay"} id={"card" + drumType + "_layer_delay"}>
            <div className="container_setter_Delay">
                <input
                    type="range"
                    className='setters_stepDelay setters_Delay'
                    id={"setter_stepDelay_" + index}
                    name={"setter_stepDelay_" + index}
                    onChange={changeStepDelay}
                    value={Delay.DelayArray[index].step}
                    min={1}
                    max={4}
                    step={1}
                    list="markers_stepDelay"
                />
                <datalist id="markers_stepDelay">
                    {[1, 2, 3, 4].map(v => <option key={v} value={v} label={v.toString()} />)}
                </datalist>
                <p>Step</p>
            </div>
            <div className="container_setter_Delay">
                <input
                    type="range"
                    className='setters_feedbackDelay setters_Delay'
                    id={"setter_feedbackDelay_" + index}
                    name={"setter_feedbackDelay_" + index}
                    onChange={changeFeedbackDelay}
                    value={Delay.DelayArray[index].feedback}
                    min={1}
                    max={4}
                    step={1}
                    list="markers_feedbackDelay"
                />
                <datalist id="markers_feedbackDelay">
                    {[1, 2, 3, 4].map(v => <option key={v} value={v} label={v.toString()} />)}
                </datalist>
                <p>Feedback</p>
            </div>
            <div className='vertical-wrapper'>
                <input
                    type="range"
                    className='vertical volumeDelay'
                    id={"volDelay_" + drumType}
                    step="5"
                    value={Delay.DelayArray[index].inputVolume}
                    onChange={changeInputVolumeDelay}
                />
            </div>
            <p>Volume</p>
            {Delay.DelayArray[index].is_active ? (
                <button onClick={() => switchIsActiveDelay(false)} className="button_menu button_Delay button_inactive_delay">ON</button>
            ) : (
                <button onClick={() => switchIsActiveDelay(true)} className="button_menu button_Delay button_active_delay">OFF</button>
            )}
        </div>
    );
};

export default DrumBoxLineDelay;