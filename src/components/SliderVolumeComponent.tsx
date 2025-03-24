import React from 'react';

type Props = {
    volume: number;
};

const SliderVolumeComponent: React.FC<Props> = (volume) => (
    <div className='vertical-wrapper'>
        <input type="range" className='vertical' id="volume" />
    </div>
);


export default SliderVolumeComponent;