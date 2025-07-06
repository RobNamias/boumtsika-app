const initialPatternLength = 64;
export let patternLength = initialPatternLength;
export let numeroPage = 1;

// Génère un tableau vide (5 pistes x patternLength)
function createEmptyPatternArray(length = patternLength): boolean[][] {
    return Array.from({ length: 5 }, () => Array(length).fill(false));
}

// PatternArray typé et initialisé proprement
export let PatternArray: boolean[][] = createEmptyPatternArray();

// Change la longueur du pattern et réinitialise PatternArray
export function setLength(newValue: number) {
    patternLength = newValue;
    PatternArray = createEmptyPatternArray(patternLength);
}

// Change la page courante
export function setPage(newPage: number) {
    numeroPage = newPage;
}

// Retourne le pattern de la page courante (16 steps)
export function getCurrentPatternArray(numberPage: number) {
    const currentPatternArray: boolean[][] = [[], [], [], [], []];
    const start = (numberPage - 1) * 16;
    for (let j = 0; j < PatternArray.length; j++) {
        for (let i = start; i < start + 16; i++) {
            currentPatternArray[j].push(PatternArray[j][i]);
        }
    }
    return currentPatternArray;
}

// Réinitialise PatternArray à false partout
export function setClear() {
    PatternArray = createEmptyPatternArray(patternLength);
    console.log("PatternArray", PatternArray);
}

// Active/désactive un span
export function setSpanActive(i: number, j: number, is_on: boolean) {
    PatternArray[i][j] = is_on;
}

// Remplace PatternArray par un nouveau tableau
export function set(newPatternArray: boolean[][]) {
    PatternArray = newPatternArray;
}

// Auto-remplissage d'une piste selon un motif ou aléatoire
export function autoCompleteByIndex(index: number, value: string) {
    const newPatternArray: boolean[] = [];
    for (let i = 0; i < patternLength; i++) {
        if (parseInt(value)) {
            newPatternArray.push(i % parseInt(value) === 0);
        } else {
            newPatternArray.push(Math.random() < 0.5);
        }
    }
    PatternArray[index] = newPatternArray;
    // console.log(PatternArray)
}

