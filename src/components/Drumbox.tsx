// Effet pour appliquer le clignotement uniquement au bouton STOP d'enregistrement


import React, { useState, useRef, ChangeEvent, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getValue } from '@testing-library/user-event/dist/utils';
import { switchDrumSet, playSample } from '../utilities/';
import * as Util from '../utilities/';
import { exportDrumData, importDrumData } from '../utilities/drumDataIO';
import { useWebAudio, useAudioBuffers } from '../hooks/';
import { usePatternPage } from '../hooks/usePatternPage';
import { useDrumPlayback } from '../hooks/useDrumPlayback';
import Drum from './Drum';
import DrumBoxLine from './DrumBoxLine';
import AudioRecorder from './AudioRecorder';
import Visualizator from './Visualizator';
import { DrumType, DrumSet } from '../models/';

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

  // Hooks d'état
  const [bpm, setBpm] = useState<number>(130);
  const [currentPage, setCurrentPage] = useState(1);
  const [playingPage, setPlayingPage] = useState<number | null>(null);
  const [localVolumes, setLocalVolumes] = useState(Util.Volumes.VolumeArray);
  const [volumesRefreshKey, setVolumesRefreshKey] = useState(0);
  const [showLoader] = useState(false);
  const hoverTimeouts = useRef<NodeJS.Timeout[]>([]);
  const delayTimeouts = useRef<NodeJS.Timeout[]>([]);
  const counterRef = useRef(0);

  const [isLectureActive, setIsLectureActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loopPageOnly, setLoopPageOnly] = useState(false);
  const [pendingLecture, setPendingLecture] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isRecordingBlinking, setIsRecordingBlinking] = useState(false);

  // Effet pour appliquer le clignotement uniquement au bouton STOP d'enregistrement
  useEffect(() => {
    const recStopBtn = document.querySelector('.audio-recorder-stop, #button_stop_rec');
    if (recStopBtn) {
      if (isRecordingBlinking) {
        recStopBtn.classList.add('blinking-red');
      } else {
        recStopBtn.classList.remove('blinking-red');
      }
    }
  }, [isRecordingBlinking]);

  // Web Audio API
  const { audioCtx, mediaDestination, analyser, initAudio } = useWebAudio();
  const { buffers, loading } = useAudioBuffers(audioCtx, drums);

  // Fonction pour jouer un drum
  // Fonction pour jouer un drum
  const addActiveDrum = useCallback((type: string, volume: number) => {
    setActiveDrums(prev => {
      if (prev.some(d => d.type === type && d.volume === volume)) return prev;
      return [...prev, { type, volume }];
    });
  }, [setActiveDrums]);
  const removeActiveDrum = useCallback((type: string, volume: number) => {
    setActiveDrums(prev => prev.filter(d => !(d.type === type && d.volume === volume)));
  }, [setActiveDrums]);

  const bpmInterval = 1000 / (bpm / 60) / 4;

  const playDrum = useCallback(
    (drumSet: DrumSet, drumTypeIndex: number, spanIndex: number, volumeOverride?: number) => {
      const volume =
        typeof volumeOverride === 'number'
          ? volumeOverride
          : Util.Volumes.VolumeArray[drumTypeIndex] / 100 *
          Util.Volumes.VolumesBySpan[drumTypeIndex][spanIndex] / 100;

      const buffer = buffers[drumSet.type];

      if (!Number.isFinite(volume)) {
        console.warn("[DEBUG] playDrum : volume non valide", { drum: drumSet.type, volume });
        return;
      }

      // Correction : relance le contexte si fermé ou suspendu
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      if (!buffer || !audioCtx || audioCtx.state !== "running") {
        console.warn("[DEBUG] playDrum : buffer ou audioCtx non valide", { drum: drumSet.type, buffer, audioCtxState: audioCtx?.state });
        return;
      }

      // Route le son vers mediaDestination uniquement si enregistrement actif
      const destination: AudioNode | undefined = isRecording && mediaDestination ? mediaDestination : undefined;
      playSample(audioCtx, buffer, volume, destination, analyser ?? undefined);
      addActiveDrum(drumSet.type, volume);
      setTimeout(() => removeActiveDrum(drumSet.type, volume), 200);

      // Effet delay
      if (Util.Delay.DelayArray[drumTypeIndex].is_active) {
        let initialVolume = volume * Util.Delay.DelayArray[drumTypeIndex].inputVolume / 100;
        for (let i = 0; i <= Util.Delay.DelayArray[drumTypeIndex].feedback; i++) {
          const delayVolume = Math.max(0.1, initialVolume - 0.1 * i);
          const timeout = setTimeout(() => {
            playSample(audioCtx, buffer, delayVolume, destination);
          }, Util.Delay.DelayArray[drumTypeIndex].step * i * (bpmInterval));
          delayTimeouts.current.push(timeout);
        }
      }
    },
    [buffers, audioCtx, mediaDestination, analyser, addActiveDrum, removeActiveDrum, bpmInterval, isRecording]
  );

  // Changement d'un kit de batterie à l'autre
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

  // Hooks personnalisés
  const toggle_page = usePatternPage(currentPage, setCurrentPage, drums);

  // On wrap la fonction Lecture pour mettre à jour playingPage
  const {
    startLecture,
    stopLecture
  } = useDrumPlayback({
    bpm,
    drums,
    playDrum,
    loopPageOnly,
    setIsLectureActive,
    analyser,
    mediaDestination,
    buffers,
    audioCtx,
    initAudio,
    loading,
    setPendingLecture,
    counterRef,
    hoverTimeouts,
    delayTimeouts,
  });
  // Fonctions synchronisation lecture/page
  const startLectureWithPage = useCallback(() => {
    // Lance la lecture et met à jour la page jouée, que l'enregistrement soit actif ou non
    setPlayingPage(Util.Pattern.numeroPage);
    if (!isLectureActive) {
      startLecture();
    }
  }, [startLecture, isLectureActive]);

  const stopLectureWithPage = useCallback(() => {
    setPlayingPage(null);
    stopLecture();
  }, [stopLecture]);
  // Démarre la lecture automatiquement lors du début d'enregistrement
  const prevRecordingRef = useRef(isRecording);
  useEffect(() => {
    // Démarre la lecture automatiquement uniquement si enregistrement démarre ET lecture n'est pas déjà active
    if (isRecording && !isLectureActive) {
      startLectureWithPage();
    }
    // Arrête la lecture uniquement si l'enregistrement vient de passer de true à false
    if (prevRecordingRef.current && !isRecording && isLectureActive) {
      stopLectureWithPage();
    }
    prevRecordingRef.current = isRecording;
  }, [isRecording, isLectureActive, startLectureWithPage, stopLectureWithPage]);
  // Fonction Lecture modifiée pour suivre la page jouée
  // Lecture n'est plus utilisée, suppression


  // Effets lecture, clavier, blink
  // Effet pour appliquer le clignotement uniquement au bouton STOP d'enregistrement
  useEffect(() => {
    const recStopBtn = document.querySelector('.audio-recorder-stop, #button_stop_rec');
    if (recStopBtn) {
      if (isRecordingBlinking) {
        recStopBtn.classList.add('blinking-red');
      } else {
        recStopBtn.classList.remove('blinking-red');
      }
    }
  }, [isRecordingBlinking]);
  useEffect(() => {
    if (pendingLecture && audioCtx && buffers && Object.keys(buffers).length > 0) {
      setPendingLecture(false);
      startLectureWithPage();
    }
  }, [audioCtx, buffers, pendingLecture, startLectureWithPage]);

  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")
      ) return;
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (isLectureActive) {
          stopLecture();
        } else if (!loading) {
          startLectureWithPage();
        }
      }
    };
    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [isLectureActive, loading, startLectureWithPage, stopLecture]);

  useEffect(() => {
    let blinkInterval: NodeJS.Timeout | null = null;
    if (isLectureActive) {
      setIsBlinking(true);
      blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 60000 / bpm);
    } else {
      setIsBlinking(false);
    }
    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, [isLectureActive, bpm]);

  useEffect(() => {
    let blinkInterval: NodeJS.Timeout | null = null;
    if (isRecording && isLectureActive) {
      setIsRecordingBlinking(true);
      blinkInterval = setInterval(() => {
        setIsRecordingBlinking(prev => !prev);
      }, 60000 / bpm);
    } else {
      setIsRecordingBlinking(false);
    }
    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, [isRecording, isLectureActive, bpm]);

  // Gestion du son par piste
  const setVolumeSound = (event: ChangeEvent<HTMLInputElement>) => {
    const drumTypeKey = event?.currentTarget.id.replace("vol", "") as keyof typeof DrumType;
    Util.Volumes.setByType(drums[DrumType[drumTypeKey]], Number(getValue(event?.currentTarget)));
    setLocalVolumes([...Util.Volumes.VolumeArray]);
    setVolumesRefreshKey(prev => prev + 1);
  };

  // Import/export via utilitaire
  const handleExport = () => {
    const url = exportDrumData(drums, bpm);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PoumTsiKa_save.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      importDrumData(
        e.currentTarget.files[0],
        (Data) => {
          setDrums(
            Array.isArray(Data.setDrumSet)
              ? Data.setDrumSet.map((drum: any, idx: number) => ({
                type: drum.type,
                drumKit: drum.drumKit ?? drums[idx]?.drumKit ?? "808",
                path: drum.path,
                audio: drums[idx]?.audio ?? null,
                is_active: drum.is_active ?? true
              }))
              : []
          );
          setBpm(typeof Data.bpm === "number" ? Data.bpm : 120);

          if (Array.isArray(Data.PatternArray)) Util.Pattern.set(Data.PatternArray);
          if (Array.isArray(Data.VolumeArray)) Util.Volumes.setVolumeArray(Data.VolumeArray);
          if (Array.isArray(Data.VolumesBySpan)) Util.Volumes.setVolumesBySpan(Data.VolumesBySpan);
          if (Array.isArray(Data.DelayArray)) Util.Delay.setDelay(Data.DelayArray);
          if (Array.isArray(Data.FillArray)) Util.Fill.setFillArray(Data.FillArray);

          setLocalVolumes([...Util.Volumes.VolumeArray]);
          setVolumesRefreshKey(prev => prev + 1);

          // Réactualise l'affichage des spans actifs
          if (Array.isArray(Data.setDrumSet) && Array.isArray(Data.PatternArray)) {
            for (let i = 0; i < Data.setDrumSet.length; i++) {
              const listSpanByDrum = document.getElementsByClassName("sdd_" + Data.setDrumSet[i].type);
              for (let j = 0; j < Data.PatternArray[i].length; j++) {
                if (Data.PatternArray[i][j]) {
                  listSpanByDrum[j]?.children[0].classList.add("span_active");
                } else {
                  listSpanByDrum[j]?.children[0].classList.remove("span_active");
                }
              }
            }
          }
        },
        (error) => {
          alert("Erreur d'import : " + error);
        }
      );
    }
  };

  //Reset du pattern
  const clearPattern = () => {
    Util.Pattern.setClear();
    const spanList = document.getElementsByClassName("span_drum");
    for (let i = 0; i < spanList.length; i++)
      spanList[i].classList.remove("span_active");
  };

  //Mute et solo
  const handleMuted = (e: React.MouseEvent<HTMLButtonElement>) => {
    const drumTypeKey = e.currentTarget.id.replace("mute_", "");
    Util.switchMuted(drums, drumTypeKey);
  };

  const handleSolo = (e: React.MouseEvent<HTMLButtonElement>) => {
    const drumTypeKey = e.currentTarget.id.replace("solo_", "");
    Util.switchSolo(drums, drumTypeKey, e.currentTarget);
  };

  return (
    <div className='container_drumbox' style={{ position: 'relative' }}>
      {showLoader && (
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
        <div id="container_kit_choice">
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

        </div>
        <div id="container_kit_info">
          {/* SAUVEGARDE */}
          <button className="button_menu" onClick={handleExport} disabled={loading}>💾 Exporter</button>
          <input type="file" id="loadFileInput" accept=".json" hidden onChange={handleImport} />
          <button className="button_menu" onClick={() => document.getElementById('loadFileInput')?.click()} disabled={loading}>📂 Importer</button>
          <button className="button_menu" onClick={() => clearPattern()} disabled={loading}>❌ Effacer</button>
        </div>
        {/* ENREGISTREMENT AUDIO */}
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <AudioRecorder
            audioCtx={audioCtx}
            mediaDestination={mediaDestination}
            loading={loading}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        </div>
      </div>
      <div id="container_input">
        <div id="container_set_time">
          {[1, 2, 3, 4].map(pageNum => (
            <button
              key={pageNum}
              onClick={() => toggle_page(pageNum)}
              className={
                'button_menu button_set_nb_time' +
                (Util.Pattern.numeroPage === pageNum ? ' nb_time_active' : '') +
                (playingPage === pageNum ? ' nb_time_hover' : '')
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
              <button onClick={startLectureWithPage} className="button_menu" id="button_lecture" disabled={loading}>PLAY</button>
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
              <button
                onClick={stopLectureWithPage}
                className={`button_menu lecture_en_cours${isBlinking ? " blinking-red" : ""}`}
                id="button_stop"
              >
                STOP
              </button>
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
          onChange={e => {
            stopLecture();
            const newBpm = Number(getValue(e.currentTarget));
            if (newBpm > 0 && newBpm < 1000) setBpm(newBpm);
          }}
          value={bpm}
          disabled={loading}
        />
      </div>

      {/* DRUMBOX */}
      <PadsWrapper>
        {drums.length > 0 ? (
          drums.map((drum, i) => (
            <div className="drum_line" id={drum.type} key={drum.type}>
              <div className="drum_line_options" id={"dlo_" + drum.type}>
                <button
                  className={`mute_button button_menu small_button${!drum.is_active ? " is_muted" : ""}`}
                  id={"mute_" + drum.type}
                  onClick={handleMuted}
                  disabled={loading}
                  style={!drum.is_active ? { background: "#d32f2f", color: "#fff" } : {}}
                >
                  M
                </button>
                <button
                  className="solo_button button_menu small_button"
                  id={"solo_" + drum.type}
                  onClick={handleSolo}
                  disabled={loading}
                >
                  S
                </button>
              </div>
              <Drum
                drumType={drum.type}
                onClick={() => Util.drumFunction(drum.type)}
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
                index={i}
                page={currentPage}
                volumesRefreshKey={volumesRefreshKey}
              />
            </div>
          ))
        ) : (
          <p>No drums available. Please load a drum set.</p>
        )}
      </PadsWrapper>

      <Visualizator
        drums={drums}
        activeDrums={activeDrums}
        analyser={analyser}
        isLectureActive={isLectureActive}
      />
    </div >
  );
};

export default DrumBox;