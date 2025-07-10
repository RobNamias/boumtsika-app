import React, { useRef, useState, useEffect } from 'react';

type Drum = {
    type: string;
};

type VisualizatorProps = {
    drums: Drum[];
    activeDrums?: { type: string, volume: number }[];
    analyser?: AnalyserNode | null;
    isLectureActive?: boolean;
};

const DRUM_COLORS: Record<string, string> = {
    Kick: '#FF6F61',
    Snare: '#6B5B95',
    ClHat: '#88B04B',
    OpHat: '#F7CAC9',
    Crash: '#92A8D1',
};

const BAND_COLORS = ["#2ecc40", "#ffdc00", "#ff851b", "#0074d9", "#b10dc9"];

const Visualizator: React.FC<VisualizatorProps> = ({ drums, activeDrums = [], analyser, isLectureActive }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Dimensions de départ discrètes mais lisibles
    const defaultWidth = Math.max(220, drums.length * 56); // 56px par drum, minimum 220px
    const defaultHeight = 240; // 160 * 1.5

    const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = useState({ width: defaultWidth, height: defaultHeight });
    const [position, setPosition] = useState({ top: 15, right: 15 });

    // Redimensionnement depuis le coin inférieur gauche
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        setResizing(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setStartSize({ ...size });
        e.stopPropagation();
    };

    // Déplacement depuis la barre supérieure
    const handleDragMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        e.preventDefault();
    };

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (resizing) {
            const dx = startPos.x - e.clientX;
            const dy = e.clientY - startPos.y;
            setSize({
                width: Math.max(150, startSize.width + dx),
                height: Math.max(100, startSize.height + dy),
            });
        }
        if (dragging) {
            setPosition(pos => ({
                top: Math.max(0, pos.top + (e.clientY - startPos.y)),
                right: Math.max(0, pos.right - (e.clientX - startPos.x)),
            }));
            setStartPos({ x: e.clientX, y: e.clientY });
        }
    }, [resizing, dragging, startPos, startSize]);
    const handleMouseUp = React.useCallback(() => {
        setResizing(false);
        setDragging(false);
    }, []);

    useEffect(() => {
        if (resizing || dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizing, dragging, handleMouseMove, handleMouseUp]);

    // Nettoyage éventuel de timers
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        const timer = timerRef.current;
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, []);

    // Analyseur de fréquences : 1 bande par drum, alignée sur la grille
    useEffect(() => {
        if (!analyser || !isLectureActive || !canvasRef.current) return;
        let running = true;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            if (!running) return;
            if (analyser) {
                analyser.getByteFrequencyData(dataArray);
            }
            ctx!.clearRect(0, 0, canvas.width, canvas.height);

            // Découpage en N bandes (N = drums.length)
            const bands = drums.length;
            const bandWidth = Math.floor(bufferLength / bands);
            const bandValues = [];
            for (let b = 0; b < bands; b++) {
                let sum = 0;
                for (let i = b * bandWidth; i < (b + 1) * bandWidth && i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                bandValues.push(sum / bandWidth);
            }

            // Affichage des bandes alignées avec la grille
            for (let b = 0; b < bands; b++) {
                const value = bandValues[b];
                const percent = value / 255;
                const height = canvas.height * percent;
                const offset = canvas.height - height;
                const barWidth = canvas.width / bands;
                ctx!.fillStyle = DRUM_COLORS[drums[b]?.type] || BAND_COLORS[b % BAND_COLORS.length];
                ctx!.fillRect(b * barWidth, offset, barWidth - 4, height);
            }

            requestAnimationFrame(draw);
        }
        draw();
        return () => { running = false; };
    }, [analyser, isLectureActive, drums, size.width, size.height]);

    return (
        <div
            ref={containerRef}
            className='container_visu'
            style={{
                width: size.width,
                height: size.height,
                top: position.top,
                right: position.right,
                userSelect: resizing || dragging ? 'none' : 'auto',
                position: 'fixed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                className="visu-header"
                onMouseDown={handleDragMouseDown}
            />
            {/* Grille sur une seule ligne, largeur identique au canvas */}
            <div className="visu-grid" style={{ width: size.width }}>
                {drums.map((drum) => {
                    const active = activeDrums.find(d => d.type === drum.type);
                    const opacity = active
                        ? 0.9 - 0.6 * (active.volume ?? 0)
                        : 0.5;
                    const volumePercent = Math.round((active?.volume ?? 0) * 100);
                    return (
                        <div
                            key={drum.type}
                            className={`visu-grid-cell${active ? ' active' : ''}`}
                            style={{
                                background: DRUM_COLORS[drum.type] || '#eee',
                                opacity: opacity,
                                filter: active ? 'brightness(0.7)' : 'none',
                            }}
                        >
                            {drum.type}
                            <div className="visu-volume-bar-bg">
                                <div
                                    className="visu-volume-bar"
                                    style={{
                                        width: `${volumePercent}%`,
                                        background: DRUM_COLORS[drum.type] || '#fff'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            <canvas
                ref={canvasRef}
                width={size.width}
                height={size.height}
                className="visu-analyser-canvas"
                style={{ display: 'block', margin: 0 }}
            />
            <div
                className="resize-handle"
                onMouseDown={handleResizeMouseDown}
            />
        </div>
    );
};

export default Visualizator;