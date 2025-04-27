import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import styled from 'styled-components';
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
  const [drums, setDrums] = useState<DrumSet[]>([]);
  const [bpm, setBpm] = useState<number>(120);
  const [volumeSoundArray, setVolumeSoundArray] = useState<number[]>([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [patternArray, setPatternArray] = useState<boolean[][]>([
  ]);
  const [isLectureActive, setIsLectureActive] = useState(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const counterRef = useRef(0);
  const [show32, setShow32] = useState(true);

  const bpmInterval = 1000 / (bpm / 60) / 4;

  useEffect(() => {
    const initialDrums = switchDrumSet("808", volumeSoundArray);
    setDrums(initialDrums);
  }, [volumeSoundArray]);

  const handleSwitchDrumSet = (event: React.MouseEvent) => {
    const idClicked = event.currentTarget.id;
    const elem = document.getElementById(idClicked);
    const numDrumKit = idClicked.replace("button_", "");
    const listeButton = document.getElementsByClassName("button_kit_menu");
    const newSet = switchDrumSet(numDrumKit, volumeSoundArray);

    if (!elem?.classList.contains("drum_active")) {
      for (let i = 0; i < listeButton.length; i++) {
        listeButton[i].classList.remove("drum_active")
      }
      elem?.classList.add("drum_active");
      setDrums(newSet);
      stopLecture();
    }
  };

  const setVolumeSound = (event: ChangeEvent<HTMLInputElement>) => {
    const e = event?.currentTarget;
    const drumTypeKey = e.id.replace("vol", "") as keyof typeof DrumType;
    const index = DrumType[drumTypeKey];
    const volumeSound = Number(getValue(e)) / 100;
    console.log("Entrée de setVolume : " + volumeSound);

    // On crée un nouveau tableau de drums avec le volume modifié
    setDrums(prevDrumSet => {
      const newDrums = [...prevDrumSet];
      var drum = newDrums[index];
      drum.volume = volumeSound;
      console.log(drum.volume)
      volumeSoundArray[index] = drum.volume;
      setVolumeSoundArray([...volumeSoundArray]);
      return newDrums;
    });
  };

  const handlePlayDrum = (drumSet: DrumSet): void => {
    const audio = new Audio(drumSet.path);
    console.log(drumSet.volume)
    audio.volume = drumSet.volume;
    audio.play();
  };

  const toggle_display = (e: React.MouseEvent): void => {
    if (e.currentTarget.id.replace("show_32_", "") !== show32.toString()) {
      stopLecture();
      if (show32 === false) {
        setShow32(true);
        for (let i = 17; i < 33; i++) {
          const listeSpan = document.getElementsByClassName("sdd_" + i);
          for (let j = 0; j < listeSpan.length; j++) {
            listeSpan[j].setAttribute("style", ("display: flex;"))
          }
        }
        for (let i = 4; i < 8; i++) {
          const listeSeparation = document.getElementsByClassName("sep_" + i)
          for (let j = 0; j < listeSeparation.length; j++) {
            listeSeparation[j].setAttribute("style", ("display: flex;"));
          }
        }
      }
      else {
        setShow32(false);
        for (let i = 4; i < 8; i++) {
          const listeSeparation = document.getElementsByClassName("sep_" + i)
          for (let j = 0; j < listeSeparation.length; j++) {
            listeSeparation[j].setAttribute("style", ("display: none;"));
          }
        }
        for (let i = 17; i < 33; i++) {
          const listeSpan = document.getElementsByClassName("sdd_" + i);
          for (let j = 0; j < listeSpan.length; j++) {
            listeSpan[j].setAttribute("style", ("display: none;"))
          }
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
        drums[i].pattern[counterRef.current - 1] = true
        handlePlayDrum(drums[i]);
      }
      else {
        drums[i].pattern[counterRef.current - 1] = false
      }
      patternArray[i] = drums[i].pattern
      setPatternArray([...patternArray])
    }
  };

  // const getPattern = (DrumType)

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
              setDrums(Data.drumSet ?? []);
              setBpm(Data.bpm ?? 120);
              for (let i = 0; i < drums.length; i++) {
                volumeSoundArray[i] = Data.drumSet[i].volume
                patternArray[i] = Data.drumSet[i].pattern
              }
              setVolumeSoundArray([...volumeSoundArray])
              setPatternArray([...patternArray])

              for (let i = 0; i < patternArray.length; i++) {
                const listSpanByDrum = document.getElementsByClassName("sdd_" + drums[i].type)
                for (let j = 0; j < patternArray[i].length; j++) {
                  if (patternArray[i][j]) {
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
              const elem = document.getElementById("button_" + Data.drumSet[0].drumKit);
              elem?.classList.add("drum_active");

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

        <button className="button_menu" onClick={() => saveDataToFile(drums, bpm)}>💾 Exporter</button>

        <input type="file" id="loadFileInput" accept=".json" hidden onChange={loadDataFromFile} />
        <button className="button_menu" onClick={() => document.getElementById('loadFileInput')?.click()}>📂 Importer</button>

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
              <Drum
                drumType={drum.type}
                onClick={() => handlePlayDrum(drum)}
              />
              <div className='vertical-wrapper'>
                <input
                  type="range"
                  className='vertical'
                  id={"vol" + drum.type}
                  step="5"
                  onChange={setVolumeSound}
                  value={drum.volume * 100}
                />
              </div>
              <DrumBoxLine
                drumType={drum.type}
              />
            </div>
          ))
        ) : (
          <p>No drums available. Please load a drum set.</p>
        )}
      </PadsWrapper>
    </div>
  );
};

export default DrumBox;
