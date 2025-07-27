import React, { useEffect } from 'react';
import * as Fill from '../utilities/fillManager';

type Props = {
    drumType: string;
    index: number;
    page: number; // <-- Ajoute cette prop
    localFill: number[]; // <--- c'est bien un tableau de 16 valeurs pour la page courante
    setLocalFill: (v: typeof Fill.FillArray) => void;
    pageOffset: number;
};

const DrumBoxLineFill: React.FC<Props> = ({ drumType, index, page, localFill, setLocalFill, pageOffset }) => {
    const indexes = Array.from({ length: 16 }, (_, i) => i + 1);

    const setFillBySpan = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = Number(e.currentTarget.value);
        if (newValue > 0 && newValue <= 10) {
            const spanIdx = Number(e.currentTarget.id.replace('spanFillInput_' + drumType + '_', "")) - 1;
            // Met à jour la valeur globale à la bonne position (pageOffset + spanIdx)
            Fill.setBySpan(newValue, index, pageOffset + spanIdx);
            setLocalFill([...Fill.FillArray]);
        }
    };

    useEffect(() => {
        // Synchronise les fills à chaque changement de page
        setLocalFill([...Fill.FillArray]);
    }, [page, setLocalFill]);

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
                                max="9"
                                onChange={setFillBySpan}
                                value={localFill[idx - 1] ?? 1}
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