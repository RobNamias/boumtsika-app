import React from 'react';

var isLectureActive = false;
var counter = 0;
var bpm = 60;
var bpmInterval = 1000 / (bpm / 60) / 4;
const nothing = () => {
    console.log("ne rien faire")
    finish()
}
const finish = () => {
    console.log(bpmInterval)
    clearInterval(intervalId);
}
const bip = () => {
    counter++
    if (counter === 17) {
        counter = 1
    }
    if (counter % 4 === 1) {
        console.log(counter, "temps", (counter - 1) / 4 + 1);
    }
    else {
        console.log(counter)
    }
}

var intervalId = setInterval(nothing, 0);
const start = () => {
    if (isLectureActive === false) {
        isLectureActive = true;
        intervalId = setInterval(bip, bpmInterval);
    } else {
        isLectureActive = false
        counter = 0
        finish()
    }
}

const Header = () => {
    return (
        <div className='container_header'>
            <div className='titre'>Boum Tsi Kla v0.003</div>
            <button onClick={start}>Play</button>
            <div id="bip" className="display"></div>
        </div>
    );
};

export default Header;