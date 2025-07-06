import React from 'react';
import * as Fill from '../utilities/fillManager';

type Props = {
    drumType: string;
    index: number;
    localFill: typeof Fill.FillArray;
    setLocalFill: (v: typeof Fill.FillArray) => void;
};

const DrumBoxLineFill: React.FC<Props> = ({ drumType, index, localFill, setLocalFill }) => {
    const indexes = Array.from({ length: 16 }, (_, i) => i + 1);

    const setFillBySpan = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = Number(e.currentTarget.value);
        if (newValue > 0 && newValue <= 10) {
            const timeIndex = Number(e.currentTarget.id.replace('spanFillInput_' + drumType + '_', "")) - 1;
            Fill.setBySpan(newValue, index, timeIndex);
            setLocalFill([...Fill.FillArray]);
        }
    };

    return (
        <div className={"dbl_fill layer card" + drumType + "_layer layer_fill"} id={"card" + drumType + "_layer_fill"}>
            <div className='container_fill' id={'container_fill' + drumType}>
                {indexes.map(idx => (
                    <React.Fragment key={idx}>
                        <div className='spanFill'>
                            <label htmlFor={'spanFillInput_' + drumType + '_' + idx}>1/ </label>
                            <input
                                type="number"
                                id={'spanFillInput_' + drumType + '_' + idx}
                                name={'spanFillInput_' + drumType + '_' + idx}
                                min="1"
                                max="10"
                                onChange={setFillBySpan}
                                value={Fill.FillArray[index][idx - 1]}
                                placeholder="Sélectionner la probabilité de lire le sample"
                            />
                        </div>
                        {idx % 4 === 0 && idx < 16 && <div className={"separation sep_" + idx / 4} />}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default DrumBoxLineFill;