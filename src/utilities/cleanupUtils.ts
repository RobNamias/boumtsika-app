import { MutableRefObject } from 'react';

/**
 * Nettoie et vide un tableau de timeouts (ref.current).
 */
export function clearTimeouts(ref: MutableRefObject<NodeJS.Timeout[]>) {
    ref.current.forEach(timeout => clearTimeout(timeout));
    ref.current = [];
}

/**
 * Nettoie et vide un tableau d'intervals (ref.current).
 */
export function clearIntervals(ref: MutableRefObject<NodeJS.Timeout[]>) {
    ref.current.forEach(interval => clearInterval(interval));
    ref.current = [];
}