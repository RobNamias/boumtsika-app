import React, { useState } from 'react';
import SpanDrum from "./SpanDrum";
import DrumBoxLineVolume from './DrumBoxLineVolume';
import DrumBoxLineDelay from './DrumBoxLineDelay';
import DrumBoxLineAutocomplete from './DrumBoxLineAutocomplete';
import DrumBoxLineFill from './DrumBoxLineFill';
import * as Volumes from '../utilities/volumesManager';
import * as Delay from '../utilities/delayManager';
import * as Fill from '../utilities/fillManager';

type Props = {
    drumType: string;
    index: number;
};

const DrumBoxLine: React.FC<Props> = (drumType) => {
    let indexes: number[] = [];
    let i: number;
    for (i = 1; i <= 16; i++) {
        indexes.push(i);
    }

    const [localVolumesBySpan, setLocalVolumesBySpan] = useState(Volumes.VolumesBySpan);
    const [degreesOfGroove, setDegreesOfGroove] = useState(Volumes.DegreesOfGroove);
    const [localDataDelay, setLocalDataDelay] = useState(Delay.DelayArray);
    const [localFill, setLocalFill] = useState(Fill.FillArray);
    const [isFlipped, setIsFlipped] = useState(false);




    //Fonction pour afficher le volet d'option souhaité, sur une flipcard
    const getLayer = (type: string, drumType: string) => {
        const card = document.getElementById("card" + drumType)
        const card_front = document.getElementById("card" + drumType + "_front")
        const card_back = document.getElementById("card" + drumType + "_back")
        // console.log(card_back, card_front)
        const layer = document.getElementById("card" + drumType + "_layer_" + type)
        // console.log(layer)
        if (layer) {
            if (!layer?.classList.contains("current_layer")) {
                const display_layers = document.getElementsByClassName("card" + drumType + "_layer")
                for (let i = 0; i < display_layers.length; i++) {
                    display_layers[i].classList.remove("current_layer")
                }
                layer?.setAttribute("style", "display:flex;")
                layer?.classList.add("current_layer")
                if (isFlipped === false) {
                    card_back?.appendChild(layer)
                    card?.setAttribute("style", "transform: rotateX(0.5turn);")

                    if (card_front?.children.length !== undefined && card_front?.children.length > 0) {
                        for (let i = 0; i < card_front.children.length; i++) {
                            card_front.children[i].setAttribute("style", "display:none;")
                        }
                    }
                }
                else {
                    card_front?.appendChild(layer)
                    card?.setAttribute("style", "transform: rotateX(1turn);")

                    if (card_back?.children.length !== undefined && card_back?.children.length > 0) {
                        for (let i = 0; i < card_back?.children.length; i++) {
                            card_back?.children[i].setAttribute("style", "display:none;")
                        }
                    }
                }
                setIsFlipped(!isFlipped)
            }
        }
    }
    return (
        <>
            <div className='drum_box_line' id={'dbl_' + drumType.drumType}>
                <div className='container_options' id={'co_' + drumType.drumType}>
                    <div className="container_selector_option">
                        <button className='button_menu small_button' onClick={() => getLayer("volume", drumType.drumType)}>V</button>
                        <button className='button_menu small_button' onClick={() => getLayer("delay", drumType.drumType)}>D</button>
                        <button className='button_menu small_button' onClick={() => getLayer("autocomplete", drumType.drumType)}>A</button>
                        <button className='button_menu small_button' onClick={() => getLayer("fill", drumType.drumType)}>F</button>
                    </div>
                    <div className="container_card">
                        <div className="card" id={"card" + drumType.drumType}>
                            <div className="front" id={"card" + drumType.drumType + "_front"}>
                                <DrumBoxLineVolume
                                    drumType={drumType.drumType}
                                    index={drumType.index}
                                    degreesOfGroove={degreesOfGroove}
                                    setDegreesOfGroove={setDegreesOfGroove}
                                    setLocalVolumesBySpan={setLocalVolumesBySpan}
                                />
                            </div>
                            <div className="back" id={"card" + drumType.drumType + "_back"}></div>
                        </div>
                        <DrumBoxLineDelay
                            drumType={drumType.drumType}
                            index={drumType.index}
                            localDataDelay={localDataDelay}
                            setLocalDataDelay={setLocalDataDelay}
                        />
                        <DrumBoxLineAutocomplete
                            drumType={drumType.drumType}
                            index={drumType.index}
                        />
                        <DrumBoxLineFill
                            drumType={drumType.drumType}
                            index={drumType.index}
                            localFill={localFill}
                            setLocalFill={setLocalFill}
                        />
                    </div>
                </div>
                {
                    indexes.map(index => (
                        <React.Fragment key={`span_${index}`}>
                            <SpanDrum
                                drumType={drumType.drumType}
                                index={index}
                            />
                            {index % 4 === 0 && index < 16 && <div className={"separation sep_" + index / 4} key={`sep_span_${index}`}></div>}
                        </React.Fragment>
                    ))
                }
            </div >
        </>
    )
};


export default React.memo(DrumBoxLine);


