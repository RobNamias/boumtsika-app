
const initialPatternArray: boolean[][] = [[], [], [], [], []]


for (let i = 0; i < initialPatternArray.length; i++) {
    for (let j = 0; j < 32; j++) {
        initialPatternArray[i].push(false)
    }
}
export var PatternArray = initialPatternArray


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

export function autoCompleteByIndex(index: number, value: string) {
    var newPatternArray: boolean[] = [];
    for (let i = 0; i < 32; i++) {
        if (parseInt(value)) {
            if (i % parseInt(value) === 0) {
                newPatternArray.push(true)
            }
            else {
                newPatternArray.push(false)
            }
        }
        else {
            if (Math.random() < 0.5) {
                newPatternArray.push(true)
            }
            else {
                newPatternArray.push(false)
            }
        }
    }

    PatternArray[index] = newPatternArray
    console.log(PatternArray)
}

