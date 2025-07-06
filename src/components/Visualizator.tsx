import React, { useRef, useState } from 'react';

// On attend un prop drums (array d'objets DrumBox)
type Drum = {
    type: string;
    // autres propriétés si besoin
};

type VisualizatorProps = {
    drums: Drum[];
    activeDrums?: { type: string, volume: number }[];
};

const DRUM_COLORS: Record<string, string> = {
    Kick: '#FF6F61',    // Rouge corail
    Snare: '#6B5B95',   // Violet doux
    ClHat: '#88B04B',   // Vert frais
    OpHat: '#F7CAC9',   // Rose pâle
    Crash: '#92A8D1',   // Bleu pastel
    // Tom: '#FFD662',     // Jaune doux
    // Clap: '#955251',    // Marron rosé
    // Perc: '#B565A7',    // Violet vif
    // FX: '#009B77',      // Vert canard
};

const Visualizator: React.FC<VisualizatorProps> = ({ drums, activeDrums = [] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 250, height: 150 });
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = useState({ width: 250, height: 150 });
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

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
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
        };
        const handleMouseUp = () => {
            setResizing(false);
            setDragging(false);
        };

        if (resizing || dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizing, dragging, startPos, startSize]);

    // Calcul du nombre de colonnes pour une grille carrée
    const gridCols = Math.ceil(Math.sqrt(drums.length));
    const gridRows = Math.ceil(drums.length / gridCols);

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
                flexDirection: 'column'
            }}
        >
            <div
                className="visu-header"
                onMouseDown={handleDragMouseDown}
                style={{
                    width: '100%',
                    height: 24,
                    cursor: 'move',
                    background: 'rgba(255,255,255,0.08)',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    flexShrink: 0
                }}
            />
            <div
                className="visu-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                    width: '100%',
                    height: `calc(100% - 24px)`,
                    position: 'relative'
                }}
            >
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
                                border: '2px solid #fff2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                color: '#222',
                                transition: 'opacity 0.3s cubic-bezier(.4,2,.6,1), filter 0.3s cubic-bezier(.4,2,.6,1), transform 0.2s',
                                filter: active ? 'brightness(0.7)' : 'none',
                                userSelect: 'none',
                                position: 'relative'
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
            <div
                className="resize-handle"
                onMouseDown={handleResizeMouseDown}
            />
        </div>
    );
};

export default Visualizator;