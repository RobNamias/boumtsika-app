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
  const [bpm, setBpm] = useState<number>(130);
  const [currentPage, setCurrentPage] = useState(1);
  const [localVolumes, setLocalVolumes] = useState(Util.Volumes.VolumeArray);
  const [volumesRefreshKey, setVolumesRefreshKey] = useState(0);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const hoverTimeouts = useRef<NodeJS.Timeout[]>([]);
  const delayTimeouts = useRef<NodeJS.Timeout[]>([]);
  const counterRef = useRef(0);

  const [isLectureActive, setIsLectureActive] = useState(false);
  const [loopPageOnly, setLoopPageOnly] = useState(false);
  const [pendingLecture, setPendingLecture] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showLoader] = useState(false);

  const bpmInterval = 1000 / (bpm / 60) / 4;

  // Web Audio API
  const { audioCtx, mediaDestination, analyser, initAudio } = useWebAudio();
  const { buffers, loading } = useAudioBuffers(audioCtx, drums);

  // Enregistrement audio
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Nettoyage mémoire
  useEffect(() => {
    return () => {
      // Ne ferme le contexte audio que si tu quittes vraiment l'app
      // if (audioCtx && typeof audioCtx.close === "function" && audioCtx.state !== "closed") {
      //   audioCtx.close();
      // }
      if (intervalId.current) clearInterval(intervalId.current);
      hoverTimeouts.current.forEach(timeout => clearTimeout(timeout));
      hoverTimeouts.current = [];
      delayTimeouts.current.forEach(timeout => clearTimeout(timeout));
      delayTimeouts.current = [];
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL, recorder]);

  // Gestion du recorder
  useEffect(() => {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    if (mediaDestination) {
      const newRecorder = new MediaRecorder(mediaDestination.stream, { mimeType: 'audio/webm;codecs=opus' });
      newRecorder.ondataavailable = e => {
        chunksRef.current.push(e.data);
      };
      newRecorder.onstop = () => {
        if (audioURL) URL.revokeObjectURL(audioURL);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        chunksRef.current = [];
      };
      setRecorder(newRecorder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaDestination]);

  const startRecording = () => {
    initAudio();
    chunksRef.current = [];
    if (isLectureActive) {
      stopLecture();
    }
    if (loopPageOnly) {
      const page = Util.Pattern.numeroPage;
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
      stopLecture();
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

  // Fonction pour jouer un drum
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

      const destination: AudioNode | undefined =
        recorder && recorder.state === "recording" && mediaDestination
          ? mediaDestination
          : undefined;
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
    [buffers, audioCtx, recorder, mediaDestination, analyser, addActiveDrum, removeActiveDrum, bpmInterval]
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

  const {
    startLecture,
    stopLecture,
    Lecture
  } = useDrumPlayback({
    bpm,
    drums,
    playDrum,
    loopPageOnly,
    setIsLectureActive,
    analyser,
    recorder,
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

  // Effets lecture, clavier, blink
  useEffect(() => {
    if (pendingLecture && audioCtx && buffers && Object.keys(buffers).length > 0) {
      setPendingLecture(false);
      startLecture();
    }
  }, [audioCtx, buffers, pendingLecture, startLecture]);

  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")
      ) return;
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (isLectureActive) stopLecture();
        else if (!loading) startLecture();
      }
    };
    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [isLectureActive, loading, startLecture, stopLecture]);

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
        <button className="button_menu" onClick={handleExport} disabled={loading}>💾 Exporter</button>
        <input type="file" id="loadFileInput" accept=".json" hidden onChange={handleImport} />
        <button className="button_menu" onClick={() => document.getElementById('loadFileInput')?.click()} disabled={loading}>📂 Importer</button>
        <button className="button_menu" onClick={() => clearPattern()} disabled={loading}>❌ Effacer</button>
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

      <div id="container_input">
        <div id="container_set_time">
          {[1, 2, 3, 4].map(pageNum => (
            <button
              key={pageNum}
              onClick={() => toggle_page(pageNum)}
              className={
                'button_menu button_set_nb_time' +
                (Util.Pattern.numeroPage === pageNum ? ' nb_time_active' : '')
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
              <button
                onClick={stopLecture}
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
      {/* ENREGISTREMENT AUDIO */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        {(!recorder || recorder.state !== "recording") && (
          <button
            className="button_menu"
            onClick={startRecording}
            disabled={!recorder || loading}
          >
            🔴REC
          </button>
        )}
        {recorder && recorder.state === "recording" && (
          <button
            className="button_menu lecture_en_cours"
            onClick={stopRecording}
            disabled={!recorder || loading}
          >
            Arrêter
          </button>
        )}
      </div>
      <Visualizator
        drums={drums}
        activeDrums={activeDrums}
        analyser={analyser}
        isLectureActive={isLectureActive}
      />
    </div>
  );
};

export default DrumBox;