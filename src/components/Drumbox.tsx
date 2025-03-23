import React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

// Components
import Drum from './Drum';
import DrumBoxLine from './DrumBoxLine';
import { switchDrumSet } from '../utilities/loadDrumSet';

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
    drumSet = switchDrumSet("808"); // Load the default drum set
    setDrums([...drumSet]); // Update state with the loaded drum set
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
    // console.log("voir l'array DrumSet : ", drumSet);
  };

  const handlePlayDrum = (sound: string): void => {
    const audio = new Audio(sound);
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
                  onClick={() => handlePlayDrum(drum.sound)}
                />
                <DrumBoxLine />
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