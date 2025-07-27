import { MutableRefObject, useRef, useCallback } from "react";
import * as Util from '../utilities/';
import { DrumSet } from '../models/';

type UseDrumPlaybackParams = {
    bpm: number;
    drums: DrumSet[];
    playDrum: (...args: any[]) => void;
    loopPageOnly: boolean;
    setIsLectureActive: (v: boolean) => void;
    analyser: any;
    mediaDestination: any;
    buffers: Record<string, AudioBuffer>;
    audioCtx: AudioContext | null;
    initAudio: () => void;
    loading: boolean;
    setPendingLecture: (v: boolean) => void;
    counterRef: MutableRefObject<number>;
    hoverTimeouts: MutableRefObject<NodeJS.Timeout[]>;
    delayTimeouts: MutableRefObject<NodeJS.Timeout[]>;
};

export function useDrumPlayback({
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
}: UseDrumPlaybackParams) {
    const bpmInterval = 1000 / (bpm / 60) / 4;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const stopLecture = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        document.querySelectorAll('.span_survol').forEach(el => el.classList.remove('span_survol'));
        hoverTimeouts.current.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout));
        hoverTimeouts.current = [];
        delayTimeouts.current.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout));
        delayTimeouts.current = [];
        setIsLectureActive(false);
        counterRef.current = 0;
        Array.from(document.getElementsByClassName("button_set_nb_time")).forEach((element) => {
            (element as HTMLElement).classList.remove("button_set_nb_time_survol");
        });
        // On garde le log d'erreur uniquement
        // console.debug("[DEBUG] stopLecture appelé, lecture stoppée, compteur remis à zéro.");
    }, [setIsLectureActive, hoverTimeouts, delayTimeouts, counterRef]);

    const Lecture = useCallback(() => {
        // Suppression des logs de debug de fonctionnement normal

        if (loopPageOnly) {
            const page = Util.Pattern.numeroPage;
            const startStep = (page - 1) * 16;
            const endStep = page * 16;
            if (counterRef.current < startStep || counterRef.current >= endStep) {
                counterRef.current = startStep;
                // console.debug("[DEBUG] Lecture : reset du compteur à startStep", startStep);
            }
            const survol = (counterRef.current - startStep) + 1;
            Array.from(document.getElementsByClassName("span_" + survol)).forEach((element) => {
                element.classList.add("span_survol");
                const timeout = setTimeout(() => {
                    element.classList.remove("span_survol");
                }, bpmInterval);
                hoverTimeouts.current.push(timeout);
            });

            for (let i = 0; i < Util.Pattern.PatternArray.length; i++) {
                const drumType = drums[i]?.type;
                const buffer = buffers[drumType];

                if (
                    drums[i].is_active &&
                    Util.Pattern.PatternArray[i][counterRef.current]
                ) {
                    const fillValue = Util.Fill.FillArray[i][counterRef.current];
                    if (fillValue <= 1 || Math.random() < 1 / fillValue) {
                        if (!buffer) {
                            console.warn(`[DEBUG] Lecture : buffer manquant pour drum ${drumType} à l'étape ${counterRef.current}`);
                        }
                        playDrum(drums[i], i, counterRef.current);
                    }
                }
            }

            counterRef.current++;
            if (counterRef.current >= endStep) {
                hoverTimeouts.current.forEach(timeout => clearTimeout(timeout));
                hoverTimeouts.current = [];
                delayTimeouts.current.forEach(timeout => clearTimeout(timeout));
                delayTimeouts.current = [];
                document.querySelectorAll('.span_survol').forEach(el => el.classList.remove('span_survol'));
                counterRef.current = startStep;
                // console.debug("[DEBUG] Lecture : fin de page, compteur remis à startStep", startStep);
            }
        } else {
            if (counterRef.current >= Util.Pattern.patternLength) {
                counterRef.current = 0;
                // console.debug("[DEBUG] Lecture : compteur remis à zéro (fin du pattern)");
            }
            const page_survolee = Math.trunc(counterRef.current / 16) + 1;
            document.getElementById("show_page" + page_survolee)?.classList.add("button_set_nb_time_survol");
            if (page_survolee > 1) {
                document.getElementById("show_page" + (page_survolee - 1).toString())?.classList.remove("button_set_nb_time_survol");
            } else {
                document.getElementById("show_page4")?.classList.remove("button_set_nb_time_survol");
            }
            if (Math.trunc(counterRef.current / 16) === Util.Pattern.numeroPage - 1) {
                const survol = counterRef.current - 16 * (Util.Pattern.numeroPage - 1) + 1;
                Array.from(document.getElementsByClassName("span_" + survol)).forEach((element) => {
                    element.classList.add("span_survol");
                    const timeout = setTimeout(() => {
                        element.classList.remove("span_survol");
                    }, bpmInterval);
                    hoverTimeouts.current.push(timeout);
                });
            }
            for (let i = 0; i < Util.Pattern.PatternArray.length; i++) {
                const drumType = drums[i]?.type;
                const buffer = buffers[drumType];

                if (
                    drums[i].is_active &&
                    Util.Pattern.PatternArray[i][counterRef.current]
                ) {
                    if (!buffer) {
                        console.warn(`[DEBUG] Lecture : buffer manquant pour drum ${drumType} à l'étape ${counterRef.current}`);
                    }
                    playDrum(drums[i], i, counterRef.current);
                }
            }
            counterRef.current++;
        }
    }, [loopPageOnly, bpmInterval, drums, playDrum, counterRef, hoverTimeouts, delayTimeouts, buffers]);

    const startLecture = useCallback(() => {
        if (!audioCtx) {
            initAudio();
            setPendingLecture(true);
            // console.debug("[DEBUG] startLecture : audioCtx absent, initialisation demandée.");
            return;
        }
        setIsLectureActive(true);
        counterRef.current = loopPageOnly
            ? (Util.Pattern.numeroPage - 1) * 16
            : 0;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(Lecture, bpmInterval);
        // console.debug("[DEBUG] startLecture : lecture démarrée, compteur =", counterRef.current);
    }, [audioCtx, loopPageOnly, bpmInterval, Lecture, initAudio, setIsLectureActive, setPendingLecture, counterRef]);

    return {
        startLecture,
        stopLecture,
        Lecture,
    };
}