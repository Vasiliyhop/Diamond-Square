export const colorize = (c) => {
    let fillColor
    switch (true) {
        case (c < 64):
            fillColor = 'blue'
            break
        case (c > 64 && c < 92):
            fillColor = 'yellow'
            break
        case (c > 92 && c < 160):
            fillColor = 'green'
            break
        case (c > 160 && c < 224):
            fillColor = 'darkgreen'
            break
        case (c > 224):
            fillColor = 'lightgray'
            break
    }
    return fillColor
}
export const materialIndex = (c) => {
    let index = 0
    switch (true) {
        case (c < 64):
            index = 0
            break
        case (c >= 64 && c < 92):
            index = 1
            break
        case (c >= 92 && c < 160):
            index = 2
            break
        case (c >= 160 && c < 224):
            index = 3
            break
        case (c >= 224):
            index = 4
            break
    }
    return index
}