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
// import { set_DBL_LocalVolumesBySpan } from './DrumBoxLine'
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

  const handleSwitchDrumSet = (event: React.MouseEvent) => {
    const numDrumKit = event.currentTarget.id.replace("button_", "");
    const newSet = switchDrumSet(numDrumKit);
    const listeButton = document.getElementsByClassName("button_kit_menu");

    for (let i = 0; i < newSet.length; i++) {
      const buttonMute = document.getElementById("mute_" + newSet[i].type);
      if (buttonMute?.classList.contains("is_muted")) {
        newSet[i].is_active = false
      }
    }

    if (!event.currentTarget?.classList.contains("drum_active")) {
      setDrums(newSet);
      for (let i = 0; i < listeButton.length; i++) {
        listeButton[i].classList.remove("drum_active")
      }
      event.currentTarget?.classList.add("drum_active");

      if (isLectureActive) {
        stopLecture();
      }
      // intervalId.current = setInterval(drumSetpreview, bpmInterval)
    }
  };

  // const drumSetpreview = () => {
  //   handlePlayDrum(drums[counterRef.current]);
  //   counterRef.current++
  //   if (counterRef.current === drums.length) {
  //     if (intervalId.current) {
  //       clearInterval(intervalId.current);
  //     }
  //     counterRef.current = 0
  //   }
  // }



  const setVolumeSound = (event: ChangeEvent<HTMLInputElement>) => {
    const e = event?.currentTarget;
    const id = e.id.replace("vol", "");
    const drumTypeKey = id as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    // console.log(index + " " + Number(getValue(e)));
    Volumes.setByType(drums[index], Number(getValue(e)));
    setLocalVolumes([...Volumes.VolumeArray]);
  };

  const handlePlayDrum = (drumSet: DrumSet, volume: number): void => {
    const audio = new Audio(drumSet.path);

    const drumTypeKey = drumSet.type as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    // console.log(Volumes.getByIndex(index))
    if (drums[index].is_active) {
      audio.volume = Volumes.VolumeArray[index] / 100 * volume / 100
      console.log(audio.volume)
      audio.play();
    }
  };

  const toggle_display = (e: React.MouseEvent): void => {
    if (e.currentTarget.id.replace("show_32_", "") !== show32.toString()) {
      stopLecture();
      for (let i = 17; i < 33; i++) {
        const listInputVol = document.getElementsByClassName("spanVolume" + i);
        const listeSpan = document.getElementsByClassName("sdd_" + i);
        if (show32 === false) {
          for (let j = 0; j < listeSpan.length; j++) {
            listeSpan[j].setAttribute("style", ("display: flex;"))
            listInputVol[j].setAttribute("style", ("display: flex;"))
          }
        }
        else {
          for (let j = 0; j < listeSpan.length; j++) {
            listeSpan[j].setAttribute("style", ("display: none;"))
            listInputVol[j].setAttribute("style", ("display: none;"))
          }
        }
        for (let i = 4; i < 8; i++) {
          const listeSeparation = document.getElementsByClassName("sep_" + i)
          if (show32 === false) {
            for (let j = 0; j < listeSeparation.length; j++) {
              listeSeparation[j].setAttribute("style", ("display: flex;"));
            }
            setShow32(true);
          }
          else {
            for (let j = 0; j < listeSeparation.length; j++) {
              listeSeparation[j].setAttribute("style", ("display: none;"));
            }
            setShow32(false);
          }

        }
        // 
        const listeButton = document.getElementsByClassName("button_set_nb_time");
        for (let i = 0; i < listeButton.length; i++) {
          listeButton[i].classList.remove("nb_time_active")
        }
        e?.currentTarget.classList.add("nb_time_active");
      }
    }
  }

  const setbpm = (e: React.FormEvent<HTMLInputElement>): void => {
    stopLecture();
    const newBpm = Number(getValue(e.currentTarget));
    if (newBpm > 0 && newBpm < 1000) {
      setBpm(newBpm);
    }
  };

  const stopLecture = (): void => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    setIsLectureActive(false);
    counterRef.current = 0;
  };

  const Lecture = () => {
    var nb_Time: number = show32 ? 32 : 16;
    if (counterRef.current === nb_Time) {
      counterRef.current = 0;
    }
    counterRef.current++;
    const spanClass = document.getElementsByClassName("span_" + counterRef.current);
    for (let i = 0; i < spanClass.length; i++) {
      const elem = spanClass[i];
      elem.classList.add("span_survol");
      setTimeout(() => {
        elem.classList.remove("span_survol");
      }, bpmInterval);

      if (elem.classList.contains("span_active")) {
        const drumTypeKey = drums[i].type as keyof typeof DrumType;
        const index = DrumType[drumTypeKey];
        handlePlayDrum(drums[i], Volumes.VolumesBySpan[index][counterRef.current - 1]);
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
              const elem = document.getElementById("button_" + Data.setDrumSet[0].drumKit);
              elem?.classList.add("drum_active");

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
    const id = e.currentTarget.id.replace("mute_", "");
    // console.log(id);
    const drumTypeKey = id as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    // console.log(index)
    if (drums[index].is_active) {
      e.currentTarget.classList.add("is_muted");
      drums[index].is_active = false
    }
    else {
      e.currentTarget.classList.remove("is_muted");
      drums[index].is_active = true
    }
    // console.log(drums[index].is_active)
  }

  const switchSolo = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.id.replace("solo_", "");
    // console.log(id);
    const drumTypeKey = id as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    if (e.currentTarget.classList.contains("drum_active") !== true) {
      e.currentTarget.classList.add("drum_active")
      for (let i = 0; i < drums.length; i++) {
        const button_mute = document.getElementById("mute_" + drums[i].type)
        const button_solo = document.getElementById("solo_" + drums[i].type)
        if (i !== index) {
          drums[i].is_active = false
          button_mute?.classList.add("is_muted")
          button_solo?.classList.remove("drum_active")
        }
        else {
          drums[i].is_active = true
          button_mute?.classList.remove("is_muted")
          button_solo?.classList.add("drum_active")
        }
      }
    }
    else {
      e.currentTarget.classList.remove("drum_active");

      for (let i = 0; i < drums.length; i++) {
        drums[i].is_active = true
        // console.log("mute_" + drums[i].type)
        const button_mute = document.getElementById("mute_" + drums[i].type)
        button_mute?.classList.remove("is_muted")
      }
    }
  }

  const drumFunction = (drum: DrumSet) => {
    // handlePlayDrum(drum, 80)
    const dbl_vol = document.getElementById("dbl_volume_" + drum.type)
    // console.log(dbl_vol)
    if (dbl_vol?.classList.contains("dbl_vol_active")) {
      dbl_vol?.classList.remove("dbl_vol_active")
    }
    else {
      dbl_vol?.classList.add("dbl_vol_active")
    }

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
                // onClick={() => handlePlayDrum(drum, 100)}
                onClick={() => drumFunction(drum)}
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
