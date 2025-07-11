import React, { useState, useEffect } from 'react';
import SpanDrum from "./SpanDrum";
import DrumBoxLineVolume from './DrumBoxLineVolume';
import DrumBoxLineDelay from './DrumBoxLineDelay';
import DrumBoxLineAutocomplete from './DrumBoxLineAutocomplete';
import DrumBoxLineFill from './DrumBoxLineFill';
import * as Util from '../utilities/';

type Props = {
    drumType: string;
    index: number;
    page: number;
};

type LayerType = 'volume' | 'delay' | 'autocomplete' | 'fill';

const DrumBoxLine: React.FC<Props> = ({ drumType, index, page }) => {
    let indexes: number[] = [];
    for (let i = 1; i <= 16; i++) {
        indexes.push(i);
    }

    const [localVolumesBySpan, setLocalVolumesBySpan] = useState(Util.Volumes.VolumesBySpan);
    const [degreesOfGroove, setDegreesOfGroove] = useState(Util.Volumes.DegreesOfGroove);
    const [localDataDelay, setLocalDataDelay] = useState(Util.Delay.DelayArray);
    const [localFill, setLocalFill] = useState(Util.Fill.FillArray);
    const [volumesRefreshKey, setVolumesRefreshKey] = useState(0);

    // Flipcard state
    const [isFront, setIsFront] = useState(true); // true = front visible, false = back visible
    const [frontLayer, setFrontLayer] = useState<LayerType | null>('volume');
    const [backLayer, setBackLayer] = useState<LayerType | null>(null);

    const pageOffset = (page - 1) * 16;

    // Synchronise les valeurs locales à chaque changement de page
    useEffect(() => {
        setLocalVolumesBySpan([...Util.Volumes.VolumesBySpan]);
        setLocalFill([...Util.Fill.FillArray]);
        // ...autres synchronisations si besoin
    }, [page]);

    const FLIP_DURATION = 700 / 2; // ms, à adapter selon ta transition CSS

    const handleOption = (type: LayerType) => {
        if (isFront) {
            setIsFront(false);
            setTimeout(() => {
                setFrontLayer(null);
                setBackLayer(type);
            }, FLIP_DURATION);
        } else {
            setIsFront(true);
            setTimeout(() => {
                setBackLayer(null);
                setFrontLayer(type);
            }, FLIP_DURATION);
        }
    };

    const renderLayer = (layer: LayerType | null) => {
        if (!layer) return null;
        switch (layer) {
            case 'volume':
                return (
                    <DrumBoxLineVolume
                        drumType={drumType}
                        index={index}
                        page={page}
                        degreesOfGroove={degreesOfGroove}
                        setDegreesOfGroove={setDegreesOfGroove}
                        setLocalVolumesBySpan={setLocalVolumesBySpan}
                        localVolumesBySpan={localVolumesBySpan[index]}
                        volumesRefreshKey={volumesRefreshKey}
                    />
                );
            case 'delay':
                return (
                    <DrumBoxLineDelay
                        drumType={drumType}
                        index={index}
                        localDataDelay={localDataDelay}
                        setLocalDataDelay={setLocalDataDelay}
                    />
                );
            case 'autocomplete':
                return (
                    <DrumBoxLineAutocomplete
                        drumType={drumType}
                        index={index}
                    />
                );
            case 'fill':
                return (
                    <DrumBoxLineFill
                        drumType={drumType}
                        index={index}
                        page={page}
                        localFill={localFill[index].slice(pageOffset, pageOffset + 16)}
                        setLocalFill={setLocalFill}
                        pageOffset={pageOffset}
                    />
                );
            default:
                return null;
        }
    };

    // Pour le style du bouton actif
    const getButtonClass = (type: LayerType) => {
        // Le bouton est actif si c'est l'option affichée sur la face visible
        const isActive = (isFront && frontLayer === type) || (!isFront && backLayer === type);
        return `button_menu small_button${isActive ? ' bouton_actif' : ''}`;
    };

    return (
        <>
            <div className='drum_box_line' id={'dbl_' + drumType} style={{ position: 'relative' }}>
                <div className='container_options' id={'co_' + drumType}>
                    <div className="container_selector_option"
                        id={'container_selector_option_' + drumType}>
                        {(['volume', 'delay', 'autocomplete', 'fill'] as LayerType[]).map(type => {
                            const isActive = (isFront && frontLayer === type) || (!isFront && backLayer === type);
                            return (
                                <button
                                    key={type}
                                    className={getButtonClass(type)}
                                    onClick={() => handleOption(type)}
                                    disabled={isActive}
                                    tabIndex={isActive ? -1 : 0}
                                    title={type}
                                >
                                    {type[0].toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                    <div className="container_card">
                        <div className={`card${isFront ? '' : ' flipped'}`} id={"card" + drumType}>
                            <div className="front" id={"card" + drumType + "_front"}>
                                {renderLayer(frontLayer)}
                            </div>
                            <div className="back" id={"card" + drumType + "_back"}>
                                {renderLayer(backLayer)}
                            </div>
                        </div>
                    </div>
                </div>
                {
                    indexes.map(index => (
                        <React.Fragment key={`span_${index}`}>
                            <SpanDrum
                                drumType={drumType}
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


