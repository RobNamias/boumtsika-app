import { useState } from "react";
import { switchDrumSet } from "../utilities/loadDrumSet";

const Menu = () => {
    const choixDrumkit = (event: React.MouseEvent<HTMLButtonElement>) => {
        let num_drum_kit = "808";
        const elem = event.currentTarget;
        var listButton = document.getElementsByClassName("button_kit_menu");

        if (elem.id !== null && listButton !== null) {
            for (let pas = 0; pas < listButton.length; pas++) {
                listButton[pas].setAttribute("style", ("background-color: var(--button-color)"))
            }
            elem.setAttribute("style", ("background-color:var(--button-color-active)"))
            num_drum_kit = elem.id.replace("button_", "");
        }
        switchDrumSet(num_drum_kit);
    };

    const [isMenuDeployed, setIsMenuDeployed] = useState(false);
    const [isKitMenuDeployed, setIsKitMenuDeployed] = useState(false);
    const [isFileMenuDeployed, setIsFileMenuDeployed] = useState(false);


    const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {

        //passer par les classes
        const elemId = document.getElementById(event.currentTarget.id);
        var elem = event.currentTarget?.parentElement?.children[1];
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

        const elem = event.currentTarget;
        var elemChild = elem?.parentElement?.children[1];

        if (event.currentTarget.id === "button_cache_kit") {
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
            if (elem.id === "button_cache_file" && isFileMenuDeployed === false) {
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