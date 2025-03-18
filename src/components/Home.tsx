import React from 'react';
import logo from '../logo.svg';
import "../styles/components/home.css";
const toggleHeader = () => {

    var elem = document.querySelector(".App-header");

    if (elem !== null) {

        elem.setAttribute("style", ("min-height: 0px; height: 0px"));
        // elem.setAttribute("style", "height: 0px");
        console.log(elem);
    }
};

const Home = () => {
    return (

        <div className="App-header">
            <button onClick={toggleHeader}>TEST</button>
            <img src={logo} className="App-logo" alt="logo" />
            <p>TA MERE ELLE VA JUMPER !</p>
        </div>
    );
};

export default Home;