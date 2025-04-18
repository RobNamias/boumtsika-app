import React from 'react';
import Drumbox from './components/Drumbox';
import Header from './components/Header';
// import Menu from './components/Menu';
import Home from './components/Home';

function App() {
  return (
    <div className="App">
      <Home />
      <div className="main_container_header">
        <Header />
      </div>
      <div className='main_container_drumbox'>
        <Drumbox />
      </div>
    </div >
  );
}

export default App;
