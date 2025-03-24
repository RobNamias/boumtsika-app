import logo from '../assets/img/logoApp.png';
import "../styles/components/home.css";

const toggleHeader = () => {

    var elem = document.querySelector(".App-header");

    if (elem !== null) {

        elem.setAttribute("style", ("min-height: 0px; height: 0px"));
        // elem.setAttribute("style", "height: 0px");
    }
};

const Home = () => {
    return (
        <>
            <div className='unable_orientation'>
                <div className='mess_orientation'>Merci de passer en mode paysage pour une meilleure expérience</div>
            </div>
            <div className="App-header">


                <button onClick={toggleHeader}>
                    <img src={logo} className="App-logo" alt="logo" />
                </button>
                <p>TA MERE ELLE VA JUMPER !</p>
            </div>
        </>
    );
};

export default Home;