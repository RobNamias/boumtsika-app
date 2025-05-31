
import React, { ChangeEvent, useState } from 'react';
import SpanDrum from "./SpanDrum";
import { getValue } from '@testing-library/user-event/dist/utils';
import { DrumType } from '../models/DrumType';
import * as Volumes from '../utilities/volumesManager'
import * as Pattern from '../utilities/patternManager'

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
        const drumTypeKey = id as keyof typeof DrumType;
        const indexDrum = DrumType[drumTypeKey];
        Volumes.setSpanVolume(indexDrum, index - 1, Number(getValue(e)));
        setLocalVolumesBySpan([...Volumes.VolumesBySpan]);
    };


    const autoComplete = (drumType: string) => {

        var buttons = document.getElementsByName(drumType + "nb_autocomplete");
        var valeur;
        for (let i = 0; i < buttons.length; i++) {
            const htmlButton = buttons[i] as HTMLInputElement
            if (htmlButton.checked) {
                valeur = htmlButton.value;
            }
        }
        const drumTypeKey = drumType as keyof typeof DrumType;
        console.log(valeur)
        if (valeur) {
            Pattern.autoCompleteByIndex(DrumType[drumTypeKey], valeur)
        }

        const listSpanByDrum = document.getElementsByClassName("sdd_" + drumType)
        console.log(listSpanByDrum)
        for (let j = 0; j < Pattern.PatternArray[DrumType[drumTypeKey]].length; j++) {
            if (Pattern.PatternArray[DrumType[drumTypeKey]][j]) {
                listSpanByDrum[j]?.children[0].classList.add("span_active")
            }
            else {
                listSpanByDrum[j]?.children[0].classList.remove("span_active")
            }
        }

    }
    var isFlipped = false
    const getLayer = (type: string, drumType: string) => {
        const card = document.getElementById("card" + drumType)
        const card_front = document.getElementById("card" + drumType + "_front")
        const card_back = document.getElementById("card" + drumType + "_back")
        console.log(card_back, card_front)
        const layer = document.getElementById("card" + drumType + "_layer_" + type)
        console.log(layer)
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
                    isFlipped = true
                    if (card_front?.children.length !== undefined && card_front?.children.length > 0) {
                        card_front?.children[0].setAttribute("style", "display:none;")
                    }
                }
                else {
                    card_front?.appendChild(layer)
                    card?.setAttribute("style", "transform: rotateX(1turn);")
                    isFlipped = false
                    if (card_back?.children.length !== undefined && card_back?.children.length > 0) {
                        card_back?.children[0].setAttribute("style", "display:none;")
                    }
                }
            }
        }
    }

    return (
        <>
            <div className='drum_box_line' id={'dbl_' + drumType.drumType}>
                <div className='container_options' id={'co_' + drumType.drumType}>
                    <div className="container_selector_option">
                        <button className='button_menu small_button' onClick={() => getLayer("volume", drumType.drumType)}>Vol</button>
                        <button className='button_menu small_button' onClick={() => getLayer("delay", drumType.drumType)}>D</button>
                        <button className='button_menu small_button' onClick={() => getLayer("autocomplete", drumType.drumType)}>A</button>
                    </div>


                    <div className="container_card">
                        <div className="card" id={"card" + drumType.drumType}>
                            <div className="front" id={"card" + drumType.drumType + "_front"}>

                                {/* VOLUME */}
                                <div className={"dbl_volume layer card" + drumType.drumType + "_layer layer_volume current_layer"} id={"card" + drumType.drumType + "_layer_volume"}>
                                    < div className="container_setGroove">
                                        <div className='container_input_setter_groove'>
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
                                                    value={Volumes.VolumesBySpan[drumType.index][index - 1]}
                                                    onChange={setSpanVolume}
                                                />
                                            </div>
                                        </>
                                    ))
                                    }
                                </div>


                            </div>
                            <div className="back" id={"card" + drumType.drumType + "_back"}></div>
                        </div>
                        <div className={"dbl_delay layer card" + drumType.drumType + "_layer layer_delay"} id={"card" + drumType.drumType + "_layer_delay"} > <h1>Delay... lay...lay ....lay ..... lay</h1></div>
                        <div className={"dbl_autocomplete layer card" + drumType.drumType + "_layer layer_autocomplete"} id={"card" + drumType.drumType + "_layer_autocomplete"}>
                            <fieldset className='autocomplete_container'>
                                <legend>Auto-complete</legend>

                                <div>
                                    <input type="radio" id={drumType.drumType + "ac_1"} name={drumType.drumType + "nb_autocomplete"} value="1" />
                                    <label htmlFor={drumType.drumType + "ac_1"}>1</label>
                                </div>

                                <div>
                                    <input type="radio" id={drumType.drumType + "ac_2"} name={drumType.drumType + "nb_autocomplete"} value="2" />
                                    <label htmlFor={drumType.drumType + "ac_2"}>2</label>
                                </div>
                                <div>
                                    <input type="radio" id={drumType.drumType + "ac_4"} name={drumType.drumType + "nb_autocomplete"} value="4" />
                                    <label htmlFor={drumType.drumType + "ac_4"}>4</label>
                                </div>
                                <div>
                                    <input type="radio" id={drumType.drumType + "ac_random"} name={drumType.drumType + "nb_autocomplete"} value="random" />
                                    <label htmlFor={drumType.drumType + "ac_random"}>Random</label>
                                </div>
                            </fieldset>
                            <input type="submit" className='button_menu autocomplete_submit' id={"autocomplete_submit_" + drumType.index}
                                // value="Complete"></input>
                                value="Complete" onClick={() => autoComplete(drumType.drumType)}></input>
                        </div>
                        {/* <div className="layer card1_layer layer3" id="card1_layer3"><h1>Layer Three</h1></div> */}
                    </div>




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


