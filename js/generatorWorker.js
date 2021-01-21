let options
const absent = 0
let localSeed

onmessage = function(e) {
    const type = e.data.type

    switch(type) {
        case 'SET_OPTIONS':
            options = e.data.options
            break
        case 'GENERATE':
            localSeed = e.data.seed
            const area = generateArea(localSeed)
            postMessage(area)
            break
    }
}

const random = () => {
    const x = Math.sin(localSeed++) * 10000
    const random = x - Math.floor(x)
    return options.seed === 0 ? Math.random() : random
}

const getVertex = () => {
    return random()
}

const getMiddleDispl = (vtl, vtr, vbl, vbr, delta) => {
    const mp = (vtl + vtr + vbl + vbr) / 4
    const d = random() * delta - (delta / 2)
    let mpd = mp + d
    mpd = mpd * options.level

    if (mpd < 0) mpd = 0
    if (mpd > 1) mpd = 1
    return mpd
}

const getMiddlePoints = (squares, delta, end) => {
    let middlePoints = end ? [] : {}
    for(let y=0; y < squares.length; y+=2) {
        for(let x=0; x < squares.length; x+=2) {
            const stl = squares[y][x]
            const str = squares[y][x + 1]
            const sbl = squares[y + 1][x]
            const sbr = squares[y + 1][x + 1]
            let middlePoint = getMiddleDispl(stl, str , sbl, sbr, delta)
            if (end) {
                middlePoints[y/2] ? middlePoints[y/2].push(middlePoint) : middlePoints[y/2] = [middlePoint]
            } else {
                middlePoints[y + '_' +  x] = middlePoint
            }
        }
    }
    return middlePoints
}

const generateDSMap = (squares, deep) => {
    const delta = options.k * deep / (options.size / 16)
    let middlePoints = getMiddlePoints(squares, delta)
    if (deep === 1) {
        return getMiddlePoints(squares, delta, true)
    }
    let resultSquares = []
    for(let y=0; y < squares.length; y+=2) {
        const ySpred = y * 2
        for(let x=0; x < squares.length; x+=2) {
            const xSpred = x * 2

            /*
                     .ae  
                  /       \
                stl--amp--str
              / |         |   \
            le  lmp  .mp  rmp  re
              \ |         |   /
                sbl--ump--sbr
                  \        /
                     .ue
            */
            //square top left
            const stl = squares[y][x]
            const str = squares[y][x + 1]
            const sbl = squares[y + 1][x]
            const sbr = squares[y + 1][x + 1]
            //middle point
            const mp = middlePoints[y + '_' + x]
            // above edge (get diamond)
            const ae = middlePoints[(y - 2) + '_' + x] || absent
            const ue = middlePoints[(y + 2) + '_' + x] || absent
            const le = middlePoints[y + '_' + (x - 2)] || absent
            const re = middlePoints[y + '_' + (x + 2)] || absent
            //left from middle point
            const lmp = (resultSquares[ySpred + 1] && resultSquares[ySpred + 1][xSpred - 1]) || getMiddleDispl(stl, sbl, le, mp, delta)
            const rmp = getMiddleDispl(str, sbr, re, mp, delta)
            const amp = (resultSquares[ySpred - 1] && resultSquares[ySpred - 1][xSpred + 1]) || getMiddleDispl(stl, str, ae, mp, delta)
            const ump = getMiddleDispl(sbl, sbr, ue, mp, delta)

            if (!resultSquares[ySpred]) resultSquares[ySpred] = []
            if (!resultSquares[ySpred + 1]) resultSquares[ySpred + 1] = []
            if (!resultSquares[ySpred + 2]) resultSquares[ySpred + 2] = []
            if (!resultSquares[ySpred + 3]) resultSquares[ySpred + 3] = []
            resultSquares[ySpred] =     [...resultSquares[ySpred],     ...[stl, amp], ...[amp, str]]
            resultSquares[ySpred + 1] = [...resultSquares[ySpred + 1], ...[lmp, mp], ...[mp, rmp]]
            resultSquares[ySpred + 2] = [...resultSquares[ySpred + 2], ...[lmp, mp], ...[mp, rmp]]
            resultSquares[ySpred + 3] = [...resultSquares[ySpred + 3], ...[sbl, ump], ...[ump, sbr]]
        }
    }
    // console.log(resultSquares)
    const area = generateDSMap(resultSquares, deep / 2)
    return area
}

const generateArea = (seed) => {
    localSeed = seed
    
    const area = generateDSMap([
        [getVertex(), getVertex()], 
        [getVertex(), getVertex()]
    ], options.cells)

    console.log(area)
    return area
}
