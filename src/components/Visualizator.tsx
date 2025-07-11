import React, { useRef, useState, useEffect } from 'react';
import '../styles/components/visualizator.css';

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

// Nuancier du bleu au rouge, inversé
const BAND_COLORS = [
    "#e74c3c", // Rouge
    "#ff5722", // Rouge orangé
    "#ff9800", // Orange
    "#ffc107", // Jaune orangé
    "#ffeb3b", // Jaune
    "#4caf50", // Vert
    "#00bcd4", // Cyan
    "#2196f3", // Bleu clair
    "#0074d9"  // Bleu
];

const Visualizator: React.FC<VisualizatorProps> = ({ drums, activeDrums = [], analyser, isLectureActive }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Dimensions fixes
    const defaultWidth = Math.max(300, drums.length * 50);
    const defaultHeight = 200;

    // Rayon adapté à la hauteur (arcWidth + rayon + marges <= defaultHeight)
    const arcGap = 5;
    const arcWidth = 25;
    const [size] = useState({ width: defaultWidth, height: defaultHeight }); // plus de redimensionnement
    const radius = Math.max(30, size.height / 2 - arcWidth - 30); // rayon réduit pour tenir dans defaultHeight
    const center = { x: size.width / 2, y: size.height / 2 };
    const total = drums.length;

    const [dragging, setDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ top: 5, right: 5 });
    const [showPetals, setShowPetals] = useState(true);

    // Déplacement depuis la barre supérieure
    const handleDragMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        e.preventDefault();
    };

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (dragging) {
            setPosition(pos => ({
                top: Math.max(0, pos.top + (e.clientY - startPos.y)),
                right: Math.max(0, pos.right - (e.clientX - startPos.x)),
            }));
            setStartPos({ x: e.clientX, y: e.clientY });
        }
    }, [dragging, startPos]);
    const handleMouseUp = React.useCallback(() => {
        setDragging(false);
    }, []);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, handleMouseMove, handleMouseUp]);

    // Nettoyage éventuel de timers
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        const timer = timerRef.current;
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, []);

    // Analyseur de fréquences
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

            const bands = BAND_COLORS.length;
            const bandWidth = Math.floor(bufferLength / bands);
            const bandValues = [];
            for (let b = 0; b < bands; b++) {
                let sum = 0;
                for (let i = b * bandWidth; i < (b + 1) * bandWidth && i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                bandValues.push(sum / bandWidth);
            }

            for (let b = 0; b < bands; b++) {
                const value = bandValues[b];
                const percent = value / 255;
                const height = canvas.height * percent;
                const offset = canvas.height - height;
                const barWidth = canvas.width / bands;
                ctx!.fillStyle = BAND_COLORS[b % BAND_COLORS.length];
                ctx!.fillRect(b * barWidth, offset, barWidth - 4, height);
            }

            requestAnimationFrame(draw);
        }
        draw();
        return () => { running = false; };
    }, [analyser, isLectureActive, size.width, size.height]);

    // Fonction utilitaire pour dessiner un arc SVG
    function describeArc(cx: number, cy: number, r1: number, r2: number, startAngle: number, endAngle: number) {
        const start1 = polarToCartesian(cx, cy, r1, endAngle);
        const end1 = polarToCartesian(cx, cy, r1, startAngle);
        const start2 = polarToCartesian(cx, cy, r2, endAngle);
        const end2 = polarToCartesian(cx, cy, r2, startAngle);

        return [
            "M", start1.x, start1.y,
            "A", r1, r1, 0, 0, 0, end1.x, end1.y,
            "L", end2.x, end2.y,
            "A", r2, r2, 0, 0, 1, start2.x, start2.y,
            "Z"
        ].join(" ");
    }

    function describeLabelArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
        // Arc pour le label, 2px en dessous de la courbure extérieure
        const start = polarToCartesian(cx, cy, r, startAngle + 2);
        const end = polarToCartesian(cx, cy, r, endAngle - 2);
        return [
            "M", start.x, start.y,
            "A", r, r, 0, 0, 1, end.x, end.y
        ].join(" ");
    }

    function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
        const rad = (angle - 90) * Math.PI / 180.0;
        return {
            x: cx + (r * Math.cos(rad)),
            y: cy + (r * Math.sin(rad))
        };
    }

    return (
        <div
            ref={containerRef}
            className='container_visu'
            style={{
                width: size.width,
                height: size.height,
                top: position.top,
                right: position.right,
                userSelect: dragging ? 'none' : 'auto'
            }}
        >
            <div
                className="visu-header"
                onMouseDown={handleDragMouseDown}
            >
                <button
                    className="visu-switch-btn"
                    onClick={() => setShowPetals(v => !v)}
                >
                    {showPetals ? "Drum" : "Fréquence"}
                </button>
            </div>
            {/* SVG pétales */}
            <svg
                width={size.width}
                height={size.height}
                className={`visu-petals-svg${showPetals ? ' petals-visible' : ' petals-hidden'}`}
                style={{ transform: 'rotate(280deg)', transformOrigin: '50% 50%' }}
            >
                <defs>
                    {drums.map((drum, i) => {
                        const startAngle = (360 / total) * i + arcGap;
                        const endAngle = (360 / total) * (i + 1) - arcGap;
                        const arcId = `petal-arc-${i}`;
                        // Arc pour le label, 2px en dessous de la courbure extérieure
                        const arcPath = describeLabelArc(center.x, center.y, radius + arcWidth + 3, startAngle, endAngle);
                        return (
                            <path
                                key={arcId}
                                id={arcId}
                                d={arcPath}
                                fill="none"
                            />
                        );
                    })}
                </defs>
                {drums.map((drum, i) => {
                    const active = activeDrums.find(d => d.type === drum.type);
                    const startAngle = (360 / total) * i + arcGap;
                    const endAngle = (360 / total) * (i + 1) - arcGap;
                    const color = DRUM_COLORS[drum.type] || '#eee';
                    return (
                        <g key={drum.type}>
                            <path
                                d={describeArc(center.x, center.y, radius, radius + arcWidth, startAngle, endAngle)}
                                fill={active ? color : "#ddd"}
                                opacity={active ? 0.9 : 0.5}
                                className={active ? "petal-active" : "petal"}
                                style={{
                                    filter: active ? `drop-shadow(0 0 8px ${color})` : undefined
                                }}
                            />
                            <text
                                className="petals-label"
                                fill={DRUM_COLORS[drum.type] || "#fff"}
                                fontSize={18}
                                fontWeight="bold"
                            >
                                <textPath
                                    href={`#petal-arc-${i}`}
                                    startOffset="80%" // laissé à ta convenance
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {drum.type}
                                </textPath>
                            </text>
                        </g>
                    );
                })}
                {/* Cercle central */}
                <circle
                    cx={center.x}
                    cy={center.y}
                    r={radius - 10}
                    className="petals-center"
                />
            </svg>
            {/* Canvas analyzer */}
            <canvas
                ref={canvasRef}
                width={size.width}
                height={size.height}
                className={`visu-analyser-canvas${showPetals ? ' analyser-hidden' : ' analyser-visible'}`}
            />
        </div >
    );
};

export default Visualizator;