const initialPatternLength = 64
export var patternLength = initialPatternLength
export var numeroPage = 1

export function setLength(newValue: number) {
    patternLength = newValue
}

export function setPage(newPage: number) {
    numeroPage = newPage
}

const initialPatternArray: boolean[][] = [[], [], [], [], []]


for (let i = 0; i < initialPatternArray.length; i++) {
    for (let j = 0; j < patternLength; j++) {
        initialPatternArray[i].push(false)
    }
}
export var PatternArray = initialPatternArray

export function getCurrentPatternArray(numberPage: number) {
    var currentPatternArray: boolean[][] = [[], [], [], [], []];
    const start = (numberPage - 1) * 16;
    // console.log("getCurrentPatternArray", PatternArray, numberPage)
    for (let j = 0; j < PatternArray.length; j++) {
        for (let i = start; i < start + 16; i++) {
            currentPatternArray[j].push(PatternArray[j][i]);
        }
    }
    return currentPatternArray;
}




export function setClear() {
    console.log("Je charge mon Clear Pattern")
    return initialPatternArray;
}

export function setSpanActive(i: number, j: number, is_on: boolean) {
    PatternArray[i][j] = is_on
}

export function set(newPatternArray: boolean[][]) {
    PatternArray = newPatternArray
}


//value peut valoir 1 (tous les quart-temps), 2 (demi-temps), 4 (temps) ou Random
//si value est un string contenant un nombre, on complète le tableau selon value, sinon value = Random
export function autoCompleteByIndex(index: number, value: string) {
    var newPatternArray: boolean[] = [];
    for (let i = 0; i < patternLength; i++) {
        parseInt(value) ? (i % parseInt(value) === 0 ? newPatternArray.push(true) : newPatternArray.push(false))
            :
            (Math.random() < 0.5 ? newPatternArray.push(true) : newPatternArray.push(false))
    }
    PatternArray[index] = newPatternArray
    // console.log(PatternArray)
}

