import React, { useState, useRef, ChangeEvent } from 'react';
import styled from 'styled-components';
import * as Pattern from '../utilities/patternManager';
import * as Volumes from '../utilities/volumesManager';
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
  const [drums, setDrums] = useState<DrumSet[]>(switchDrumSet("808"));
  const [localVolumes, setLocalVolumes] = useState(Volumes.VolumeArray);
  const [bpm, setBpm] = useState<number>(130);
  const [isLectureActive, setIsLectureActive] = useState(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const counterRef = useRef(0);
  const [show32, setShow32] = useState(true);

  const bpmInterval = 1000 / (bpm / 60) / 4;

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

  const setVolumeSound = (event: ChangeEvent<HTMLInputElement>) => {
    const drumTypeKey = event?.currentTarget.id.replace("vol", "") as keyof typeof DrumType;
    Volumes.setByType(drums[DrumType[drumTypeKey]], Number(getValue(event?.currentTarget)));
    setLocalVolumes([...Volumes.VolumeArray]);
  };

  const handlePlayDrum = (drumSet: DrumSet, spanVolume: number) => {
    const audio = new Audio(drumSet.path);
    const drumTypeKey = drumSet.type as keyof typeof DrumType;
    if (drums[DrumType[drumTypeKey]].is_active) {
      audio.volume = Volumes.VolumeArray[DrumType[drumTypeKey]] / 100 * spanVolume / 100
      // console.log(audio.volume)
      audio.play();
    }
  };

  const toggle_display = (e: React.MouseEvent) => {
    if (e.currentTarget.id.replace("show_32_", "") !== show32.toString()) {
      stopLecture();
      var settingToggle: string = show32 ? "display:none" : "display:flex";
      for (let i = 17; i < 33; i++) {
        const listInputVol = document.getElementsByClassName("spanVolume" + i);
        const listeSpan = document.getElementsByClassName("sdd_" + i);
        for (let j = 0; j < listeSpan.length; j++) {
          listeSpan[j].setAttribute("style", settingToggle)
          listInputVol[j].setAttribute("style", settingToggle)
        }
      }
      for (let i = 4; i < 8; i++) {
        const listeSeparation = document.getElementsByClassName("sep_" + i)
        for (let j = 0; j < listeSeparation.length; j++) {
          listeSeparation[j].setAttribute("style", settingToggle)
        }
      }
      setShow32(!show32)
    }
    // 
    const listeButton = document.getElementsByClassName("button_set_nb_time");
    for (let i = 0; i < listeButton.length; i++) {
      listeButton[i].classList.remove("nb_time_active")
    }
    e?.currentTarget.classList.add("nb_time_active")
  }

  const setbpm = (e: React.FormEvent<HTMLInputElement>) => {
    stopLecture();
    const newBpm = Number(getValue(e.currentTarget));
    if (newBpm > 0 && newBpm < 1000) {
      setBpm(newBpm);
    }
  };

  const stopLecture = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    setIsLectureActive(false)
    counterRef.current = 0
  };

  const Lecture = () => {
    var nb_Time: number = show32 ? 32 : 16;
    if (counterRef.current === nb_Time) {
      counterRef.current = 0;
    }
    counterRef.current++;
    const spanClass = document.getElementsByClassName("span_" + counterRef.current);
    for (let i = 0; i < spanClass.length; i++) {
      spanClass[i].classList.add("span_survol");
      setTimeout(() => {
        spanClass[i].classList.remove("span_survol");
      }, bpmInterval);

      if (spanClass[i].classList.contains("span_active")) {
        const drumTypeKey = drums[i].type as keyof typeof DrumType;
        handlePlayDrum(drums[i], Volumes.VolumesBySpan[DrumType[drumTypeKey]][counterRef.current - 1]);
      }
    }
  };


  const startLecture = () => {
    setIsLectureActive(true);
    intervalId.current = setInterval(Lecture, bpmInterval);
  };

  const loadDataFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      stopLecture();
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
              Pattern.set(Data.patternArray);
              Volumes.set(Data.volumeSoundArray);
              Volumes.setVolumesBySpan(Data.VolumesBySpan);
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

  const clearPattern = () => {
    Pattern.setClear()
    const spanList = document.getElementsByClassName("span_drum")
    for (let i = 0; i < spanList.length; i++)
      spanList[i].classList.remove("span_active")
  }

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

  const toggle_classes = (id: string, className: string, shouldBeActivated: boolean = true) => {
    shouldBeActivated ? document.getElementById(id)?.classList.add(className) : document.getElementById(id)?.classList.remove(className)
  }


  const drumFunction = (drumType: string) => {
    const isActivated = document.getElementById("co_" + drumType)?.classList.contains("container_option_active")
    console.log(isActivated)
    toggle_classes("co_" + drumType, "container_option_active", !isActivated)
  }


  return (
    <div className='container_drumbox'>

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

        <button className="button_menu" onClick={() => saveDataToFile(drums, bpm, Volumes.VolumeArray, Pattern.PatternArray, Volumes.VolumesBySpan)}>💾 Exporter</button>

        <input type="file" id="loadFileInput" accept=".json" hidden onChange={loadDataFromFile} />
        <button className="button_menu" onClick={() => document.getElementById('loadFileInput')?.click()}>📂 Importer</button>
        <button className="button_menu" onClick={() => clearPattern()}>❌ Effacer</button>

      </div>

      <div id="container_input">

        <div id="container_set_time">
          <button onClick={toggle_display} className='button_menu button_set_nb_time' id="show_32_false">16</button>
          <button onClick={toggle_display} className='button_menu button_set_nb_time nb_time_active' id="show_32_true">32</button>
        </div>
        {!isLectureActive &&
          <button onClick={startLecture} className="button_menu" id="button_lecture">PLAY</button>
        }
        {isLectureActive &&
          <button onClick={stopLecture} className="button_menu lecture_en_cours" id="button_stop">STOP</button>
        }

        <label htmlFor="setter_bpm">BPM :</label>

        <input
          type="number"
          id="setter_bpm"
          name="setter_bpm"
          onChange={setbpm}
          value={bpm}
        />
      </div>

      <PadsWrapper>
        {drums.length > 0 ? (
          drums.map(drum => (
            <div className="drum_line" id={drum.type} key={drum.type}>
              <div className="drum_line_options" id={"dlo_" + drum.type}>
                <button className="button_menu small_button" id={"mute_" + drum.type} onClick={switchMuted}>M</button>
                <button className="button_menu small_button" id={"solo_" + drum.type} onClick={switchSolo}>S</button>
              </div>
              <Drum
                drumType={drum.type}
                onClick={() => drumFunction(drum.type)}
              />
              <div className='vertical-wrapper'>
                <input
                  type="range"
                  className='vertical'
                  id={"vol" + drum.type}
                  step="5"
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
