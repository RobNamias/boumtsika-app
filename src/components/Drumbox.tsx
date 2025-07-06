import React, { useState, useRef, ChangeEvent, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import * as Pattern from '../utilities/patternManager';
import * as Volumes from '../utilities/volumesManager';
import * as Delay from '../utilities/delayManager';
import * as Fill from '../utilities/fillManager';
import { switchDrumSet } from '../utilities/loadDrumSet';
import { saveDataToFile } from '../utilities/saveData';
import { getValue } from '@testing-library/user-event/dist/utils';

import Drum from './Drum';
import DrumBoxLine from './DrumBoxLine';
import { DrumType } from '../models/DrumType';
import { DrumSet } from '../models/DrumSet';

import { useWebAudio } from '../hooks/useWebAudio';
import { useAudioBuffers } from '../hooks/useAudioBuffers';
import { playSample } from '../utilities/playSample';

const PadsWrapper = styled.main`
  flex: 1;
  grid-template-columns: 1fr 1fr 1fr;
`;

type DrumBoxProps = {
  drums: DrumSet[];
  setDrums: React.Dispatch<React.SetStateAction<DrumSet[]>>;
  setActiveDrums: React.Dispatch<React.SetStateAction<{ type: string; volume: number }[]>>;
  activeDrums: { type: string; volume: number }[];
};

const DrumBox: React.FC<DrumBoxProps> = ({ drums, setDrums, setActiveDrums, activeDrums }) => {
  const [bpm, setBpm] = useState<number>(130);
  const [localVolumes, setLocalVolumes] = useState(Volumes.VolumeArray);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const counterRef = useRef(0);
  const [isLectureActive, setIsLectureActive] = useState(false);
  const [loopPageOnly, setLoopPageOnly] = useState(false);
  const [pendingLecture, setPendingLecture] = useState(false);

  const bpmInterval = 1000 / (bpm / 60) / 4;

  // Web Audio API
  const { audioCtx, mediaDestination, initAudio } = useWebAudio();
  const { buffers, loading } = useAudioBuffers(audioCtx, drums);

  // Gestion de l'enregistrement audio
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Nettoyage mémoire : AudioContext, timers à la destruction du composant
  useEffect(() => {
    return () => {
      if (audioCtx && typeof audioCtx.close === "function" && audioCtx.state !== "closed") {
        audioCtx.close();
      }
      if (intervalId.current) clearInterval(intervalId.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mediaDestination) {
      const newRecorder = new MediaRecorder(mediaDestination.stream, { mimeType: 'audio/webm;codecs=opus' });
      newRecorder.ondataavailable = e => {
        chunksRef.current.push(e.data);
      };
      newRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        chunksRef.current = [];
      };
      setRecorder(newRecorder);
    }
  }, [mediaDestination]);

  const startRecording = () => {
    initAudio(); // <-- Important : initialise l'audio après interaction utilisateur
    chunksRef.current = [];
    if (isLectureActive) {
      stopLecture();
    }
    if (loopPageOnly) {
      const page = Pattern.numeroPage;
      counterRef.current = (page - 1) * 16;
    } else {
      counterRef.current = 0;
    }
    if (recorder) {
      recorder.start();
      setIsLectureActive(true);
      intervalId.current = setInterval(Lecture, bpmInterval);
    }
  };
  const stopRecording = () => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  };

  // Ajoute/retire un drum actif
  const addActiveDrum = useCallback((type: string, volume: number) => {
    setActiveDrums(prev => {
      if (prev.some(d => d.type === type && d.volume === volume)) return prev;
      return [...prev, { type, volume }];
    });
  }, [setActiveDrums]);
  const removeActiveDrum = useCallback((type: string, volume: number) => {
    setActiveDrums(prev => prev.filter(d => !(d.type === type && d.volume === volume)));
  }, [setActiveDrums]);

  // Fonction pour jouer un drum (avec contrôles/logs)
  const playDrum = useCallback(
    (drumSet: DrumSet, drumTypeIndex: number, spanIndex: number, volumeOverride?: number) => {
      const volume =
        typeof volumeOverride === 'number'
          ? volumeOverride
          : Volumes.VolumeArray[drumTypeIndex] / 100 *
          Volumes.VolumesBySpan[drumTypeIndex][spanIndex] / 100;

      const buffer = buffers[drumSet.type];
      if (!buffer) {
        console.error("playDrum: Pas de buffer pour", drumSet.type);
        return;
      }
      if (!audioCtx) {
        console.error("playDrum: Pas d'audioCtx");
        return;
      }
      if (audioCtx.state !== "running") {
        console.warn("playDrum: AudioContext fermé, impossible de jouer le son.", audioCtx.state);
        return;
      }
      const destination: AudioNode | undefined =
        recorder && recorder.state === "recording" && mediaDestination
          ? mediaDestination
          : undefined;
      // console.log("playDrum: lecture", {
      //   drumType: drumSet.type,
      //   volume,
      //   destination,
      //   audioCtxState: audioCtx.state,
      //   isRecording: recorder?.state
      // });
      playSample(audioCtx, buffer, volume, destination);
      addActiveDrum(drumSet.type, volume);
      setTimeout(() => removeActiveDrum(drumSet.type, volume), 200);

      // Effet delay (si activé)
      if (Delay.DelayArray[drumTypeIndex].is_active) {
        let initialVolume = volume * Delay.DelayArray[drumTypeIndex].inputVolume / 100;
        for (let i = 0; i <= Delay.DelayArray[drumTypeIndex].feedback; i++) {
          const delayVolume = Math.max(0.1, initialVolume - 0.1 * i);
          setTimeout(() => {
            playSample(audioCtx, buffer, delayVolume, destination);
          }, Delay.DelayArray[drumTypeIndex].step * i * bpmInterval);
        }
      }
    },
    [audioCtx, buffers, mediaDestination, addActiveDrum, removeActiveDrum, bpmInterval, recorder]
  );

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
      if (isLectureActive) stopLecture();
    }
  };

  //Gestion du son par piste
  const setVolumeSound = (event: ChangeEvent<HTMLInputElement>) => {
    const drumTypeKey = event?.currentTarget.id.replace("vol", "") as keyof typeof DrumType;
    Volumes.setByType(drums[DrumType[drumTypeKey]], Number(getValue(event?.currentTarget)));
    setLocalVolumes([...Volumes.VolumeArray]);
  };

  //Changement de page
  function toggle_page(numero_page: number) {
    if (numero_page !== Pattern.numeroPage) {
      Pattern.setPage(numero_page);
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
  const stopLecture = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    setIsLectureActive(false)
    counterRef.current = 0
    Array.from(document.getElementsByClassName("button_set_nb_time")).forEach((element) => {
      (element as HTMLElement).classList.remove("button_set_nb_time_survol");
    });
  }, []);

  //Lecture avec logique FILL déplacée ici
  const Lecture = useCallback(() => {
    if (loopPageOnly) {
      const page = Pattern.numeroPage;
      const startStep = (page - 1) * 16;
      const endStep = page * 16;
      if (counterRef.current < startStep || counterRef.current >= endStep) {
        counterRef.current = startStep;
      }
      const survol = (counterRef.current - startStep) + 1;
      Array.from(document.getElementsByClassName("span_" + survol)).forEach((element) => {
        element.classList.add("span_survol");
        setTimeout(() => {
          element.classList.remove("span_survol");
        }, bpmInterval)
      });

      for (let i = 0; i < Pattern.PatternArray.length; i++) {
        if (
          drums[i].is_active &&
          Pattern.PatternArray[i][counterRef.current]
        ) {
          const fillValue = Fill.FillArray[i][counterRef.current];
          if (fillValue <= 1 || Math.random() < 1 / fillValue) {
            playDrum(drums[i], i, counterRef.current);
          }
        }
      }

      counterRef.current++;
      if (counterRef.current >= endStep) {
        counterRef.current = startStep;
      }
    } else {
      if (counterRef.current >= Pattern.patternLength) {
        counterRef.current = 0;
      }
      const page_survolee = Math.trunc(counterRef.current / 16) + 1;
      document.getElementById("show_page" + page_survolee)?.classList.add("button_set_nb_time_survol");
      if (page_survolee > 1) {
        document.getElementById("show_page" + (page_survolee - 1).toString())?.classList.remove("button_set_nb_time_survol");
      } else {
        document.getElementById("show_page4")?.classList.remove("button_set_nb_time_survol");
      }
      if (Math.trunc(counterRef.current / 16) === Pattern.numeroPage - 1) {
        const survol = counterRef.current - 16 * (Pattern.numeroPage - 1) + 1;
        Array.from(document.getElementsByClassName("span_" + survol)).forEach((element) => {
          element.classList.add("span_survol");
          setTimeout(() => {
            element.classList.remove("span_survol");
          }, bpmInterval)
        })
      }
      for (let i = 0; i < Pattern.PatternArray.length; i++) {
        if (
          drums[i].is_active &&
          Pattern.PatternArray[i][counterRef.current]
        ) {
          playDrum(drums[i], i, counterRef.current);

          if (Fill.FillArray[i][counterRef.current] > 1) {
            for (let fill = 1; fill < Fill.FillArray[i][counterRef.current]; fill++) {
              if (Math.random() < 1 / Fill.FillArray[i][counterRef.current]) {
                playDrum(drums[i], i, counterRef.current);
              }
            }
          }
        }
      }
      counterRef.current++;
    }
  }, [loopPageOnly, bpmInterval, drums, playDrum]);

  const startLecture = useCallback(() => {
    if (!audioCtx) {
      initAudio();
      setPendingLecture(true); // On attend que l'audioCtx soit prêt et les buffers chargés
      return;
    }
    setIsLectureActive(true);
    if (loopPageOnly) {
      const page = Pattern.numeroPage;
      counterRef.current = (page - 1) * 16;
    } else {
      counterRef.current = 0;
    }
    intervalId.current = setInterval(Lecture, bpmInterval);
  }, [audioCtx, loopPageOnly, bpmInterval, Lecture, initAudio]);

  // Quand audioCtx ET buffers sont prêts, on lance la lecture si on attendait
  useEffect(() => {
    if (pendingLecture && audioCtx && buffers && Object.keys(buffers).length > 0) {
      setPendingLecture(false);
      startLecture();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioCtx, buffers]);

  // Gestion lecture/stop avec barre espace
  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (isLectureActive) {
          stopLecture();
        } else if (!loading) {
          startLecture();
        }
      }
    };
    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [isLectureActive, loading, startLecture, stopLecture]);

  //Chargement depuis un fichier
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
            setDrums(Data.setDrumSet ?? []);
            setBpm(Data.bpm ?? 120);
            Pattern.set(Data.PatternArray);
            Volumes.set(Data.VolumeArray);
            Volumes.setVolumesBySpan(Data.VolumesBySpan);
            Delay.setDelay(Data.DelayArray)
            Fill.set(Data.FillArray)
            setLocalVolumes([...Volumes.VolumeArray]);
            for (let i = 0; i < Pattern.PatternArray.length; i++) {
              const listSpanByDrum = document.getElementsByClassName("sdd_" + drums[i].type)
              for (let j = 0; j < Pattern.PatternArray[i].length; j++) {
                Pattern.PatternArray[i][j] ? listSpanByDrum[j]?.children[0].classList.add("span_active") : listSpanByDrum[j]?.children[0].classList.remove("span_active")
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
          }
        }
        catch (error) {
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
    toggle_classes("co_" + drumType, "container_option_active", !isActivated)
  }

  // Affichage du loader pendant le chargement des samples
  return (
    <div className='container_drumbox' style={{ position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(30,30,30,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#fff'
          }}>
            <svg width="48" height="48" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 25 25" to="360 25 25" />
              </circle>
            </svg>
            <span style={{ marginTop: 12 }}>Chargement des samples…</span>
          </div>
        </div>
      )}

      {/* SELECTION DU KIT DE BATTERIE */}
      <div id="container_button_setDrum">
        <button className="button_menu button_kit_menu" id="button_707" onClick={handleSwitchDrumSet} disabled={loading}>
          707
        </button>
        <button className="button_menu button_kit_menu drum_active" id="button_808" onClick={handleSwitchDrumSet} disabled={loading}>
          808
        </button>
        <button className="button_menu button_kit_menu" id="button_909" onClick={handleSwitchDrumSet} disabled={loading}>
          909
        </button>
        <button className="button_menu button_kit_menu" id="button_Tribe" onClick={handleSwitchDrumSet} disabled={loading}>
          Tribe
        </button>
        {/* SAUVEGARDE */}
        <button className="button_menu" onClick={() => saveDataToFile(drums, bpm)} disabled={loading}>💾 Exporter</button>
        {/* CHARGEMENT */}
        <input type="file" id="loadFileInput" accept=".json" hidden onChange={loadDataFromFile} />
        <button className="button_menu" onClick={() => document.getElementById('loadFileInput')?.click()} disabled={loading}>📂 Importer</button>
        {/* RESET DU PATTERN */}
        <button className="button_menu" onClick={() => clearPattern()} disabled={loading}>❌ Effacer</button>
      </div>

      <div id="container_input">
        <div id="container_set_time">
          {[1, 2, 3, 4].map(pageNum => (
            <button
              key={pageNum}
              onClick={() => toggle_page(pageNum)}
              className={
                'button_menu button_set_nb_time' +
                (Pattern.numeroPage === pageNum ? ' nb_time_active' : '')
              }
              id={`show_page${pageNum}`}
              tabIndex={0}
              type="button"
            >
              {pageNum}
            </button>
          ))}
        </div>
        {/* LECTURE/STOP */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isLectureActive &&
            <>
              <button onClick={startLecture} className="button_menu" id="button_lecture" disabled={loading}>PLAY</button>
              <div className="checkbox-switch-vertical">
                <label className="checkbox-switch" title="Activer pour lire tout le pattern">
                  <input
                    type="checkbox"
                    checked={!loopPageOnly}
                    onChange={() => setLoopPageOnly(v => !v)}
                    disabled={loading}
                  />
                  <span className="slider"></span>
                </label>
                <div className="checkbox-labels">
                  <span className={!loopPageOnly ? "active" : ""}>1</span>
                  <span className={loopPageOnly ? "active" : ""}>4</span>
                </div>
              </div>
            </>
          }
          {isLectureActive &&
            <>
              <button onClick={stopLecture} className="button_menu lecture_en_cours" id="button_stop">STOP</button>
              <div className="checkbox-switch-vertical"></div>
            </>
          }
        </div>
        {/* TEMPO */}
        <label htmlFor="setter_bpm">BPM :</label>
        <input
          type="number"
          id="setter_bpm"
          name="setter_bpm"
          onChange={setbpm}
          value={bpm}
          disabled={loading}
        />
      </div>

      {/* DRUMBOX */}
      <PadsWrapper>
        {drums.length > 0 ? (
          drums.map(drum => (
            <div className="drum_line" id={drum.type} key={drum.type}>
              <div className="drum_line_options" id={"dlo_" + drum.type}>
                <button className="button_menu small_button" id={"mute_" + drum.type} onClick={switchMuted} disabled={loading}>M</button>
                <button className="button_menu small_button" id={"solo_" + drum.type} onClick={switchSolo} disabled={loading}>S</button>
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
                  disabled={loading}
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
      </PadsWrapper>
      {/* ENREGISTREMENT AUDIO */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          className="button_menu"
          onClick={startRecording}
          disabled={!recorder || loading}
        >
          Enregistrer
        </button>
        <button
          className="button_menu"
          onClick={stopRecording}
          disabled={!recorder || loading}
        >
          Arrêter
        </button>
        {audioURL && (
          <>
            <audio
              controls
              src={audioURL}
              onPlay={() => console.log("Lecture audio démarrée", audioURL)}
              onError={e => console.error("Erreur de lecture audio", e)}
              style={{ marginRight: 8 }}
            />
            <a
              className="button_menu"
              href={audioURL}
              download="drumbox_recording.webm"
              style={{ textDecoration: "none", marginRight: 8 }}
            >
              Télécharger
            </a>
            <button
              className="button_menu"
              onClick={() => {
                if (audioURL) URL.revokeObjectURL(audioURL);
                setAudioURL(null);
              }}
              style={{ marginRight: 8 }}
            >
              Supprimer
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DrumBox;