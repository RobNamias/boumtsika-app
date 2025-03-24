import SpanDrum from "./SpanDrum";


type Props = {
    drumType: string;
};

const DrumBoxLine: React.FC<Props> = (drumType) => {
    return (
        <div className={'drum_box_line ' + drumType}>
            <SpanDrum
                drumType={'' + drumType}
            />
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
            <span className='span_drum_div' id="span_drum1">I</span>
        </div>
    );
};

export default DrumBoxLine;