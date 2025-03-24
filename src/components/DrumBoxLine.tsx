
import SpanDrum from "./SpanDrum";


type Props = {
    drumType: string;
};

const DrumBoxLine: React.FC<Props> = (drumType) => {

    return (
        <div className={'drum_box_line dbl_' + drumType.drumType}>
            <SpanDrum
                drumType={drumType.drumType}
                index={1}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={2}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={3}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={4}
            />

            <div className="separation"></div>

            <SpanDrum
                drumType={drumType.drumType}
                index={5}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={6}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={7}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={8}
            />

            <div className="separation"></div>

            <SpanDrum
                drumType={drumType.drumType}
                index={9}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={10}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={11}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={12}
            />

            <div className="separation"></div>

            <SpanDrum
                drumType={drumType.drumType}
                index={13}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={14}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={15}
            />
            <SpanDrum
                drumType={drumType.drumType}
                index={16}
            />
        </div>
    );
};

export default DrumBoxLine;