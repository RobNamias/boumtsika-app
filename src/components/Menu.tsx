import { useState } from "react";
import { setDrumSet } from '../utilities/setDrumSet';
// import setDrumSet from '../utilities/setDrumSet';

const Menu = () => {

    const [num_DrumKit, setNumDrumKit] = useState("808");

    const getElementId = (event: React.MouseEvent<HTMLButtonElement>) => {
        const buttonId = event.currentTarget.id; // Récupère l'ID du bouton cliqué
        return (buttonId)
    }

    const choixDrumkit = (event: React.MouseEvent<HTMLButtonElement>) => {

        var num_drum_kit = num_DrumKit;
        const elemId = document.getElementById(getElementId(event));
        var listButton = document.getElementsByClassName("button_kit_menu");

        if (elemId !== null && listButton !== null) {
            for (let pas = 0; pas < listButton.length; pas++) {
                listButton[pas].setAttribute("style", ("background-color: var(--button-color)"))
            }
            elemId.setAttribute("style", ("background-color:var(--button-color-active)"))
            num_drum_kit = getElementId(event).replace("button_", "");
            setNumDrumKit(num_drum_kit)
        }
        console.log("le num_drum_kit que j'envois dans ma fonction setDrumSet via mon bouton : ", num_drum_kit)
        setDrumSet(num_drum_kit);
    };

    const [isMenuDeployed, setIsMenuDeployed] = useState(false);
    const [isKitMenuDeployed, setIsKitMenuDeployed] = useState(false);
    const [isFileMenuDeployed, setIsFileMenuDeployed] = useState(false);


    const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        const elemId = document.getElementById(getElementId(event));
        var elem = elemId?.parentElement?.children[1];
        if (isMenuDeployed === false) {
            elemId?.parentElement?.parentElement?.setAttribute("style", "height:100%")
            elem?.setAttribute("style", ("display:block"));
            setIsMenuDeployed(true);
        }
        else {
            elemId?.parentElement?.parentElement?.setAttribute("style", "height:15vh")
            elem?.setAttribute("style", ("display:none"));
            setIsMenuDeployed(false);
        }
    };

    const toggleChildMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        const elemId = getElementId(event)
        const elem = document.getElementById(elemId);
        var elemChild = elem?.parentElement?.children[1];

        if (elemId === "button_cache_kit") {
            if (isKitMenuDeployed === false) {
                elemChild?.setAttribute("style", ("display:block"));
                setIsKitMenuDeployed(true);
            }
            else {
                elemChild?.setAttribute("style", ("display:none"));
                setIsKitMenuDeployed(false);
            }
        }
        else {
            if (elemId === "button_cache_file" && isFileMenuDeployed === false) {
                elemChild?.setAttribute("style", ("display:block"));
                setIsFileMenuDeployed(true);
            }
            else {
                elemChild?.setAttribute("style", ("display:none"));
                setIsFileMenuDeployed(false);
            }
        }
    };



    return (
        <div className='container_menu'>
            <button type="button" onClick={toggleMenu} id='button_cache_menu'>Menu</button>

            <ul className='main_menu'>
                <li>
                    <button onClick={toggleChildMenu} className="button_menu" id='button_cache_kit'>Kit</button>
                    <div className='child_menu' id='kit_menu'>
                        <button onClick={choixDrumkit} className="button_menu button_kit_menu" id="button_707">707</button>
                        <button onClick={choixDrumkit} className="button_menu button_kit_menu" id="button_808">808</button>
                        <button onClick={choixDrumkit} className="button_menu button_kit_menu" id="button_909">909</button>
                        <div> {num_DrumKit} </div>
                    </div>
                </li>
                <li>
                    <button onClick={toggleChildMenu} className="button_menu" id='button_cache_file'>Fichier</button>

                    <div className='child_menu' id="file_menu">
                        <button className="button_menu">Sauvegarder</button>
                        <button className="button_menu">Importer</button>
                    </div>
                </li>
            </ul >
        </div >
    );
};

export default Menu;