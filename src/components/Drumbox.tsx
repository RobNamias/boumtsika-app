import React, { useState, useRef, ChangeEvent } from 'react';
import styled from 'styled-components';
import * as Pattern from '../utilities/patternManager';
import * as Volumes from '../utilities/volumesManager';
import * as Delay from '../utilities/delayManager';
import * as Fill from '../utilities/fillManager';
import { switchDrumSet } from '../utilities/loadDrumSet';
import { saveDataToFile } from '../utilities/saveData';
import { getValue } from '@testing-library/user-event/dist/utils';

// Components
import Drum from './Drum';
import DrumBoxLine from './DrumBoxLine';
import { DrumType } from '../models/DrumType';
import { DrumSet } from '../models/DrumSet';


const PadsWrapper = styled.main`
  flex: 1;
  grid-template-columns: 1fr 1fr 1fr;
`;

const DrumBox: React.FC = () => {
  const [drums, setDrums] = useState<DrumSet[]>(switchDrumSet("808")); //Gère le kit de batterie
  const [bpm, setBpm] = useState<number>(130); //Gere le BPM
  const [numeroPage, setNumeroPage] = useState(Pattern.numeroPage); //Affichage sur 4 ou 8 temps
  const [localVolumes, setLocalVolumes] = useState(Volumes.VolumeArray);//Gère le volume par piste
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const counterRef = useRef(0); //Compteur pour le défilement pendant la lecture
  const [isLectureActive, setIsLectureActive] = useState(false);

  const bpmInterval = 1000 / (bpm / 60) / 4; //Calcul de l'interval pour la fonction timée startLecture()

  document.onkeydown = function (event) {
    switch (event.key) {
      case " ":
        isLectureActive ? stopLecture() : startLecture();
        break;
      default:
        /* Si la touche n'est pas répertoriée dans le script, on affiche le code de cette touche pour pouvoir l'ajouter (utile seulement pendant le développement, pour connaître le code des touches */
        // console.log(event.key);
        break;
    }
  }

  //Changement d'un kit de batterie à l'autre
  const handleSwitchDrumSet = (event: React.MouseEvent) => {
    const numDrumKit = event.currentTarget.id.replace("button_", "");
    const newSet = switchDrumSet(numDrumKit);
    const listeButton = document.getElementsByClassName("button_kit_menu");

    for (let i = 0; i < newSet.length; i++) {
      const buttonMute = document.getElementById("mute_" + newSet[i].type);
      newSet[i].is_active = !buttonMute?.classList.contains("is_muted")
    }
    if (!event.currentTarget?.classList.contains("drum_active")) {
      setDrums(newSet);
      for (let i = 0; i < listeButton.length; i++) {
        listeButton[i].classList.remove("drum_active")
      }
      event.currentTarget?.classList.add("drum_active");
      isLectureActive ? stopLecture() : console.log("pourmeubler");
    }
  };

  //Gestion du son par piste
  const setVolumeSound = (event: ChangeEvent<HTMLInputElement>) => {
    const drumTypeKey = event?.currentTarget.id.replace("vol", "") as keyof typeof DrumType;
    Volumes.setByType(drums[DrumType[drumTypeKey]], Number(getValue(event?.currentTarget)));
    setLocalVolumes([...Volumes.VolumeArray]);
  };

  //Lecture d'un sample
  const handlePlayDrum = (drumSet: DrumSet, drumTypeIndex: number, spanIndex: number) => {
    const audio = new Audio(drumSet.path);
    //Check si la piste est activée et la probabilité de lecture ---> FillArray
    if (drums[drumTypeIndex].is_active && Math.random() < 1 / Fill.FillArray[drumTypeIndex][spanIndex]) {
      audio.volume = Volumes.VolumeArray[drumTypeIndex] / 100 * Volumes.VolumesBySpan[drumTypeIndex][spanIndex] / 100
      console.log(audio.volume)
      audio.play();
      // Fonction Delay
      if (Delay.DelayArray[drumTypeIndex].is_active) {
        var volume_lecture = audio.volume * Delay.DelayArray[drumTypeIndex].inputVolume / 100
        for (let i = 0; i <= Delay.DelayArray[drumTypeIndex].feedback; i++) {
          // eslint-disable-next-line no-loop-func
          setTimeout(() => {
            const audioDelay = new Audio(drumSet.path);
            volume_lecture -= 0.1
            if (volume_lecture < 0.1) {
              volume_lecture = 0.1
            }
            audioDelay.volume = volume_lecture
            // console.log("le sample à ", i, " delay à ", volume_lecture)
            audioDelay.play();
          }
            , Delay.DelayArray[drumTypeIndex].step * i * bpmInterval);
        }
      }
    }
  };


  function toggle_page(numero_page: number) {
    if (numero_page !== numeroPage) {
      console.log("Page demandée : " + numero_page)
      Pattern.setPage(numero_page);
      console.log(Pattern.numeroPage)
      setNumeroPage(numero_page);
      // console.log('show_page' + numero_page)
      const listeButton = document.getElementsByClassName("button_set_nb_time");
      for (let i = 0; i < listeButton.length; i++) {
        listeButton[i].classList.remove("nb_time_active");
        if (listeButton[i].id === "show_page" + numero_page) {
          listeButton[i].classList.add("nb_time_active");
        }
      }
      for (let i = 0; i < Pattern.PatternArray.length; i++) {
        const listSpanByDrum = document.getElementsByClassName("sdd_" + drums[i].type);
        for (let j = 0; j < Pattern.PatternArray[i].length; j++) {
          toggle_classes(listSpanByDrum[j]?.children[0].id, "span_active", Pattern.getCurrentPatternArray(numero_page)[i][j]);
        }
      }
      console.log("Page actuelle : " + numeroPage)
    }
  }

  //Mise à jour du tempo
  const setbpm = (e: React.FormEvent<HTMLInputElement>) => {
    stopLecture();
    const newBpm = Number(getValue(e.currentTarget));
    if (newBpm > 0 && newBpm < 1000) {
      setBpm(newBpm);
    }
  };

  //Arreter la lecture
  const stopLecture = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    setIsLectureActive(false)
    counterRef.current = 0
  };

  //Lecture
  const Lecture = () => {
    // console.log(Pattern.patternLength)
    if (counterRef.current === Pattern.patternLength) {
      counterRef.current = 0;
    }
    counterRef.current++;
    if (Math.trunc(counterRef.current / 16) === numeroPage - 1) {
      const survol = counterRef.current - 16 * (numeroPage - 1)
      const spanClass = document.getElementsByClassName("span_" + survol.toString());
      for (let i = 0; i < spanClass.length; i++) {
        spanClass[i].classList.add("span_survol");
        setTimeout(() => {
          spanClass[i].classList.remove("span_survol");
        }, bpmInterval);
      }
    }
    //Lecture du pattern
    for (let i = 0; i < Pattern.PatternArray.length; i++) {
      if (Pattern.PatternArray[i][counterRef.current - 1]) {
        const drumTypeKey = drums[i].type as keyof typeof DrumType;
        handlePlayDrum(drums[i], DrumType[drumTypeKey], counterRef.current - 1);
      }
    }
  };

  //Lance la lecture
  const startLecture = () => {
    setIsLectureActive(true);
    intervalId.current = setInterval(Lecture, bpmInterval);
  };

  //Chargemement depuis un fichier
  const loadDataFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      if (isLectureActive) {
        stopLecture()
      }
      const file = e.currentTarget.files[0];
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const content = event.target?.result;
          if (typeof content === "string") {
            const Data = JSON.parse(content);
            console.log("📂 Contenu du fichier chargé :", Data);
            if (Data && typeof Data === "object") {
              setDrums(Data.setDrumSet ?? []);
              setBpm(Data.bpm ?? 120);
              Pattern.set(Data.PatternArray);
              console.log(Data.VolumeArray)
              Volumes.set(Data.VolumeArray);
              Volumes.setVolumesBySpan(Data.VolumesBySpan);
              Delay.setDelay(Data.DelayArray)

              Fill.set(Data.FillArray)
              setLocalVolumes([...Volumes.VolumeArray]);

              for (let i = 0; i < Pattern.PatternArray.length; i++) {
                const listSpanByDrum = document.getElementsByClassName("sdd_" + drums[i].type)
                for (let j = 0; j < Pattern.PatternArray[i].length; j++) {
                  if (Pattern.PatternArray[i][j]) {
                    listSpanByDrum[j]?.children[0].classList.add("span_active")
                  }
                  else {
                    listSpanByDrum[j]?.children[0].classList.remove("span_active")
                  }
                }
              }
              const listeButton = document.getElementsByClassName("button_kit_menu");
              for (let i = 0; i < listeButton.length; i++) {
                listeButton[i].classList.remove("drum_active")
              }
              document.getElementById("button_" + Data.setDrumSet[0].drumKit)?.classList.add("drum_active");

              for (let i = 0; i < Data.setDrumSet.length; i++) {
                const buttonMute = document.getElementById("mute_" + Data.setDrumSet[i].type);
                if (buttonMute?.classList.contains("is_muted")) {
                  Data.setDrumSet[i].is_active = false
                }
              }
              console.log("✅ Sauvegarde Chargée !");
            } else {
              console.error("❌ Fichier de sauvegarde invalide !");
              alert("❌ Erreur : Fichier JSON invalide !");
            }
          }
        } catch (error) {
          console.error("❌ Erreur lors de l'analyse du fichier JSON :", error);
          alert("❌ Erreur : Impossible de lire le fichier JSON !");
        }
      };
      reader.readAsText(file);
    }
  };

  //Reset du pattern
  const clearPattern = () => {
    Pattern.setClear()
    const spanList = document.getElementsByClassName("span_drum")
    for (let i = 0; i < spanList.length; i++)
      spanList[i].classList.remove("span_active")
  }

  //Mute et solo
  const switchMuted = (e: React.MouseEvent<HTMLButtonElement>) => {
    const drumTypeKey = e.currentTarget.id.replace("mute_", "") as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    toggle_classes(e.currentTarget.id, "is_muted", drums[index].is_active)
    drums[index].is_active = !drums[index].is_active
  }

  const switchSolo = (e: React.MouseEvent<HTMLButtonElement>) => {
    const drumTypeKey = e.currentTarget.id.replace("solo_", "") as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    if (!e.currentTarget.classList.contains("drum_active")) {
      e.currentTarget.classList.add("drum_active")
      for (let i = 0; i < drums.length; i++) {
        toggle_classes("mute_" + drums[i].type, "is_muted", i !== index)
        toggle_classes("solo_" + drums[i].type, "drum_active", i === index)
        drums[i].is_active = i === index
      }
    }
    else {
      e.currentTarget.classList.remove("drum_active");
      for (let i = 0; i < drums.length; i++) {
        drums[i].is_active = true
        document.getElementById("mute_" + drums[i].type)?.classList.remove("is_muted")
      }
    }
  }


  //Changement de classe d'un élement
  const toggle_classes = (id: string, className: string, shouldBeActivated: boolean = true) => {
    shouldBeActivated ? document.getElementById(id)?.classList.add(className) : document.getElementById(id)?.classList.remove(className)
  }

  //Affichage des options
  const drumFunction = (drumType: string) => {
    const isActivated = document.getElementById("co_" + drumType)?.classList.contains("container_option_active")
    // console.log(isActivated)
    toggle_classes("co_" + drumType, "container_option_active", !isActivated)
  }


  return (
    <div className='container_drumbox'>
      {/* SELECTION DU KIT DE BATTERIE */}
      <div id="container_button_setDrum">
        <button className="button_menu button_kit_menu" id="button_707" onClick={handleSwitchDrumSet}>
          707
        </button>
        <button className="button_menu button_kit_menu drum_active" id="button_808" onClick={handleSwitchDrumSet}>
          808
        </button>
        <button className="button_menu button_kit_menu" id="button_909" onClick={handleSwitchDrumSet}>
          909
        </button>
        <button className="button_menu button_kit_menu" id="button_Tribe" onClick={handleSwitchDrumSet}>
          Tribe
        </button>
        {/* SAUVEGARDE */}
        <button className="button_menu" onClick={() => saveDataToFile(drums, bpm)}>💾 Exporter</button>
        {/* CHARGEMENT */}
        <input type="file" id="loadFileInput" accept=".json" hidden onChange={loadDataFromFile} />
        <button className="button_menu" onClick={() => document.getElementById('loadFileInput')?.click()}>📂 Importer</button>
        {/* RESET DU PATTERN */}
        <button className="button_menu" onClick={() => clearPattern()}>❌ Effacer</button>

      </div>

      <div id="container_input">
        {/* AFFICHAGE SUR 4 OU 8 TEMPS */}
        <div id="container_set_time">

          <button onClick={() => toggle_page(1)} className='button_menu button_set_nb_time nb_time_active' id="show_page1">1</button>
          <button onClick={() => toggle_page(2)} className='button_menu button_set_nb_time' id="show_page2">2</button>
          <button onClick={() => toggle_page(3)} className='button_menu button_set_nb_time' id="show_page3">3</button>
          <button onClick={() => toggle_page(4)} className='button_menu button_set_nb_time' id="show_page4">4</button>


          {/* <button onClick={toggle_display} className='button_menu button_set_nb_time nb_time_active' id="show_32_true">32</button> */}
        </div>
        {/* LECTURE/STOP */}
        {!isLectureActive &&
          <button onClick={startLecture} className="button_menu" id="button_lecture">PLAY</button>
        }
        {isLectureActive &&
          <button onClick={stopLecture} className="button_menu lecture_en_cours" id="button_stop">STOP</button>
        }
        {/* TEMPO */}
        <label htmlFor="setter_bpm">BPM :</label>

        <input
          type="number"
          id="setter_bpm"
          name="setter_bpm"
          onChange={setbpm}
          value={bpm}
        />
      </div>

      {/* DRUMBOX */}
      <PadsWrapper>
        {drums.length > 0 ? (
          drums.map(drum => (
            // PISTE
            <div className="drum_line" id={drum.type} key={drum.type}>

              <div className="drum_line_options" id={"dlo_" + drum.type}>
                <button className="button_menu small_button" id={"mute_" + drum.type} onClick={switchMuted}>M</button>
                <button className="button_menu small_button" id={"solo_" + drum.type} onClick={switchSolo}>S</button>
              </div>
              <Drum
                drumType={drum.type}
                onClick={() => drumFunction(drum.type)}
              />
              {/* VOLUME DE LA PISTE */}
              <div className='vertical-wrapper'>
                <input
                  type="range"
                  className='vertical'
                  id={"vol" + drum.type}
                  step={10}
                  value={localVolumes[DrumType[drum.type]]}
                  onChange={setVolumeSound}
                />
              </div>

              <DrumBoxLine
                drumType={drum.type}
                index={DrumType[drum.type]}
              />

            </div>
          ))
        ) : (
          <p>No drums available. Please load a drum set.</p>
        )}
      </PadsWrapper >
    </div >
  );
};

export default DrumBox;
