import { useState } from 'react';
import styled from 'styled-components';
// Components
import Drum from './Drum';
import drumSet from '../utilities/loadDrumSet';

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
  const [drums] = useState(drumSet); //On récup drumSet de loadDrumSet et on s'en sert pour mapper les boutons.

  const handlePlayDrum = (sound: string): void => {
    const audio = new Audio(sound);
    audio.play();
    console.log("tableau du drum kit quand on clique sur un instrument: ", drumSet);
  };

  return (


    <PadsWrapper>
      {
        drums.map(drum => (
          <Drum
            key={drum.type}
            drumType={drum.type}
            onClick={() => handlePlayDrum(drum.sound)}
          />
        ))
      }
    </PadsWrapper >
  );
};

export default Home;