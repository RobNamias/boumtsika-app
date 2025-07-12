import { DrumSet } from '../models/';
import * as Util from './';

export function exportDrumData(drums: DrumSet[], bpm: number) {
    const data = {
        setDrumSet: drums,
        bpm,
        PatternArray: Util.Pattern.PatternArray,
        VolumeArray: Util.Volumes.VolumeArray,
        VolumesBySpan: Util.Volumes.VolumesBySpan,
        DelayArray: Util.Delay.DelayArray,
        FillArray: Util.Fill.FillArray,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    return url;
}

export function importDrumData(
    file: File,
    onSuccess: (data: any) => void,
    onError?: (error: any) => void
) {
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const content = event.target?.result;
            if (typeof content === "string") {
                const data = JSON.parse(content);
                onSuccess(data);
            }
        } catch (error) {
            if (onError) onError(error);
        }
    };
    reader.readAsText(file);
}