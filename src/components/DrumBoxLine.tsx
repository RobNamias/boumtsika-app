
import SpanDrum from "./SpanDrum";


type Props = {
    drumType: string;
};

const DrumBoxLine: React.FC<Props> = (drumType) => {

    const max_index: number = 32;
    let indexes: number[] = [];
    let i: number;
    for (i = 1; i <= max_index; i++) {
        indexes.push(i);
    }

    return (
        <div className={'drum_box_line dbl_' + drumType.drumType}>
            {indexes.map(index => (
                <>
                    <SpanDrum
                        drumType={drumType.drumType}
                        index={index}
                    />
                    {/* affichage conditionnel */}
                    {index % 4 === 0 && index < max_index && <div className="separation"></div>}
                </>
            ))}
        </div>

    )
};

export default DrumBoxLine;