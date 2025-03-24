import React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { switchDrumSet } from '../utilities/loadDrumSet';
import { getValue } from '@testing-library/user-event/dist/utils';

// Components
import Drum from './Drum';
import DrumBoxLine from './DrumBoxLine';


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

  @media (max-width: 700px) {
    grid-template-columns: 1fr 1fr;
  }
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

  const handleSwitchDrumSet = (numDrumKit: string, idClicked: string) => {

    const elem = document.getElementById(idClicked)
    const listeButton = document.getElementsByClassName("button_kit_menu");

    for (let i = 0; i < listeButton.length; i++) {
      listeButton[i].classList.remove("drum_active");
    }
    elem?.classList.add("drum_active");
    drumSet = switchDrumSet(numDrumKit);
    setDrums([...drumSet]); // Update state to trigger re-render
    console.log("voir l'array DrumSet : ", drumSet);
  };


  var volumeSoundArray: number[] = [0.8, 0.8, 0.8, 0.8];

  var volumeSound: number;

  const setVolumeSound = (event: React.MouseEvent) => {
    const e = event?.currentTarget;
    volumeSound = Number(getValue(e)) / 100;
    switch (e.id.replace("vol", "")) {
      case 'ClosedHat':
        volumeSoundArray[0] = volumeSound;
        break;
      case 'Kick':
        volumeSoundArray[1] = volumeSound;
        console.log("Le volume du " + e.id.replace("vol", "") + " est mainteant à " + volumeSoundArray[1])
        break;
      case 'OpenHat':
        volumeSoundArray[2] = volumeSound;
        break;
      case 'Snare':
        volumeSoundArray[3] = volumeSound;
        break;
      default: break;
    }


    console.log("le volume est à " + volumeSound)
  }


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
        console.log("Ca coince sur le slecteur de Volume");
        break;
    }
    console.log("Le volume du " + drumType + " est lu à " + audio.volume)
    audio.play();
  };

  return (
    <div className='container_drumbox'>
      <div id="container_button_setDrum">
        <button
          className="button_kit_menu"
          id="button_707"
          onClick={() => handleSwitchDrumSet("707", "button_707")}>
          707
        </button>
        <button
          className="button_kit_menu drum_active"
          id="button_808"
          onClick={() => handleSwitchDrumSet("808", "button_808")}>
          808
        </button>
        <button
          className="button_kit_menu"
          id="button_909"
          onClick={() => handleSwitchDrumSet("909", "button_909")}>
          909
        </button>
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
                <DrumBoxLine drumType={'b' + drum.type} />
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