//fonction

import React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { switchDrumSet } from '../utilities/loadDrumSet';
import { getValue } from '@testing-library/user-event/dist/utils';

// Components
import Drum from './Drum';
import DrumBoxLine from './DrumBoxLine';

var isLectureActive = false;

var counter = 0;
var bpm = 120;
var bpmInterval = 1000 / (bpm / 60) / 4;;

const volumeSoundArray: number[] = [0.5, 0.5, 0.5, 0.5];


interface DrumSet {
  type: string;
  sound: string;
}
const PadsWrapper = styled.main`
//   padding: 5rem 0;
  flex: 1;
//   display: grid;
  grid-template-columns: 1fr 1fr 1fr;
//   grid-gap: 20px;
`;

const DrumBox: React.FC = () => {
  var drumSet: DrumSet[] = [];
  const [drums, setDrums] = useState(drumSet);
  // Load a default drum set on component mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    drumSet = switchDrumSet("808"); // Load the default drum set
    setDrums([...drumSet]); // Update state to trigger re-render
  }, []);


  // changer de DrumSet
  // const handleSwitchDrumSet = (numDrumKit: string, idClicked: string) => {
  const handleSwitchDrumSet = (event: React.MouseEvent) => {
    const idClicked = event.currentTarget.id
    const elem = document.getElementById(idClicked)
    const numDrumKit = idClicked.replace("button_", "")
    const listeButton = document.getElementsByClassName("button_kit_menu");

    if (elem?.classList.contains("drum_active") === false) {
      for (let i = 0; i < listeButton.length; i++) {
        listeButton[i].classList.remove("drum_active");
      }
      elem?.classList.add("drum_active");
      drumSet = switchDrumSet(numDrumKit);
      setDrums([...drumSet]); // Update state to trigger re-render
      stopLecture()

      // console.log("voir l'array drumSet : ", drumSet);
    }
  };

  //  changer le volume pour chaque piste


  const setVolumeSound = (event: React.MouseEvent) => {
    const e = event?.currentTarget;
    var volumeSound = Number(getValue(e)) / 100;
    switch (e.id.replace("vol", "")) {
      case 'ClosedHat':
        volumeSoundArray[0] = volumeSound;
        break;
      case 'Kick':
        volumeSoundArray[1] = volumeSound;
        break;
      case 'OpenHat':
        volumeSoundArray[2] = volumeSound;
        break;
      case 'Snare':
        volumeSoundArray[3] = volumeSound;
        break;
      default: break;
    }
  }


  // lire le fichier audio one shot
  // const handlePlayDrum = (sound: string, drumType: string): void => {
  const handlePlayDrum = (sound: string, drumType: string): void => {
    const audio = new Audio(sound);
    switch (drumType) {
      case 'ClosedHat':
        audio.volume = volumeSoundArray[0]
        break;
      case 'Kick':
        audio.volume = volumeSoundArray[1]
        break;
      case 'OpenHat':
        audio.volume = volumeSoundArray[2]
        break;
      case 'Snare':
        audio.volume = volumeSoundArray[3]
        break;
      default:
        console.log("Ca coince sur le selecteur de Volume");
        break;
    }
    // console.log("Le" + drumType + " est lu à " + audio.volume)
    audio.play();
  };

  // bouton Play

  const setbpm = (e: React.FormEvent<HTMLInputElement>): void => {
    bpm = Number(getValue(e.currentTarget))
    console.log(bpm)
    bpmInterval = 1000 / (bpm / 60) / 4;
    // bpm = newbpm
  }
  const nothing = () => {
    console.log("Ici rien ne se passe")
    stopLecture()
  }
  const stopLecture = (): void => {
    clearInterval(intervalId);
    isLectureActive = false;
    // recupérer le bouton et luio passer un innerHTML"Play"
    counter = 0
  }

  const Lecture = () => {
    counter++
    if (counter === 17) {
      counter = 1
    }
    const spanClass = document.getElementsByClassName("span_" + counter)
    for (let i = 0; i < spanClass.length; i++) {
      const elem = spanClass[i];
      elem.classList.add("span_survol")
      // console.log(elem)
      setTimeout(() => {
        elem.classList.remove("span_survol")
      }, bpmInterval)


      if (elem.classList.contains("span_active") === true) {
        handlePlayDrum(drums[i].sound, drums[i].type)
      }
      // elem.classList.remove("span_survol")
    }
  }

  var intervalId = setInterval(nothing, 0);
  const startLecture = (event: React.MouseEvent) => {

    if (isLectureActive === false) {
      event.currentTarget.classList.add('lecture_en_cours');
      isLectureActive = true;
      intervalId = setInterval(Lecture, bpmInterval);
    } else {

      event.currentTarget.classList.remove('lecture_en_cours');
      stopLecture()
    }
  }
  return (

    <div className='container_drumbox'>

      {/* le menu, en gros */}
      <div id="container_button_setDrum">
        <button
          className="button_menu button_kit_menu"
          id="button_707"
          onClick={handleSwitchDrumSet}>
          707
        </button>
        <button
          className="button_menu button_kit_menu drum_active"
          id="button_808"
          onClick={handleSwitchDrumSet}>
          808
        </button>
        <button
          className="button_menu button_kit_menu"
          id="button_909"
          onClick={handleSwitchDrumSet}>
          909
        </button>
        {/* <button onClick={testSelection} className='button_menu'></button> */}
        <button onClick={startLecture} className="button_menu" id="button_lecture">Play</button>
        <input
          type="number"
          id="setter_bpm"
          className=""
          onChange={setbpm}
          min={20}
          max={300}
        />
      </div>


      <div id="veritable_boite_a_rythme">
        <PadsWrapper>
          {drums.length > 0 ? (
            drums.map(drum => (
              <div
                className="drum_line" id={drum.type}
              >
                <Drum
                  key={drum.type}
                  drumType={drum.type}
                  onClick={() => handlePlayDrum(drum.sound, drum.type)}
                />

                <div className='vertical-wrapper'>
                  <input type="range" className='vertical' id={"vol" + drum.type}
                    step="5"
                    onClick={setVolumeSound}
                  />
                </div>
                <DrumBoxLine drumType={drum.type} />
              </div>
            ))) : (
            <p>No drums available. Please load a drum set.</p>
          )}
        </PadsWrapper >
      </div>
    </div >
  );
};

export default DrumBox;