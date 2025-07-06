import React, { useState } from 'react';
import Drumbox from './components/Drumbox';
import { switchDrumSet } from './utilities/loadDrumSet';
import Header from './components/Header';
import Home from './components/Home';
import Visualizator from './components/Visualizator';

function App() {
  const [drums, setDrums] = useState(switchDrumSet("808"));
  // Liste des drums actifs : [{type, volume}]
  const [activeDrums, setActiveDrums] = useState<{ type: string, volume: number }[]>([]);

  return (
    <div className="App">
      <Home />
      <Visualizator drums={drums} activeDrums={activeDrums} />
      <div className="main_container_header">
        <Header />
      </div>
      <div className='main_container_drumbox'>
        <Drumbox
          drums={drums}
          setDrums={setDrums}
          setActiveDrums={setActiveDrums}
          activeDrums={activeDrums}
        />
      </div>
    </div >
  );
}

export default App;
