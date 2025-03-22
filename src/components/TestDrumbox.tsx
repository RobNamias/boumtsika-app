import { useEffect, useState } from 'react';
import styled from 'styled-components';
// Components
import Drum from './Drum';
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

const Home: React.FC = () => {
  var drumSet: DrumSet[] = [];
  const [drums, setDrums] = useState(drumSet);

  // Load a default drum set on component mount
  useEffect(() => {
    drumSet = switchDrumSet("808"); // Load the default drum set
    setDrums([...drumSet]); // Update state with the loaded drum set
  }, []);

  const handleSwitchDrumSet = (numDrumKit: string) => {
    drumSet = switchDrumSet(numDrumKit);
    setDrums([...drumSet]); // Update state to trigger re-render
    console.log(drumSet);
  };

  const handlePlayDrum = (sound: string): void => {
    const audio = new Audio(sound);
    audio.play();
    console.log("tableau du drum kit quand on clique sur un instrument: ", drumSet);
  };


  return (
    <>
      <div>
        <button onClick={() => handleSwitchDrumSet("707")}>707</button>
        <button onClick={() => handleSwitchDrumSet("808")}>808</button>
        <button onClick={() => handleSwitchDrumSet("909")}>909</button>
      </div>
      <PadsWrapper>        
        { drums.length > 0 ? (
          drums.map(drum => (
            <Drum
              key={drum.type}
              drumType={drum.type}
              onClick={() => handlePlayDrum(drum.sound)}
            />
          ))) : (
        <p>No drums available. Please load a drum set.</p>
      )}
      </PadsWrapper >
    </>
  );
};

export default Home;