import options from './options.js'
import { colorize } from './colorize.js'

const boxSize = options.size / options.cells

let seed = options.seed

var generatorWorker = new Worker("./js/generatorWorker.js");

generatorWorker.postMessage({
    type: 'SET_OPTIONS',
    options: options
})

var three3DWorker = new Worker("./js/three3DWorker.js");

three3DWorker.postMessage({
    type: 'SET_OPTIONS',
    options: options
})

let canvas3D = document.getElementById('canvas-3d')
canvas3D.width = options.size
canvas3D.height = options.size
let offscreen = canvas3D.transferControlToOffscreen();

class Controls {
    constructor(generator) {
        this.generator = generator
        this.gui = new dat.GUI({ name: 'GUI' });
        this.setupControls()
    }

    setProxy(proxy) {
        this.proxy = proxy
    }

    setupControls() {
        this.color = '#fff000';
        this.heightMap = options.hm;
        this.coloredMap = options.cm;
        this.three3dMap = options.tm;
        this.Generate = this.generator.startGeneration.bind(this.generator)

        this.gui.addColor(this, 'color');
        let hm = this.gui.add(this, 'heightMap');
        document.getElementById('canvas-hm').style.display = options.hm ? 'block' : 'none'
        hm.onChange((show) => {
            this.proxy.showHeightMap = show
            document.getElementById('canvas-hm').style.display = show ? 'block' : 'none'
        })
        let cm = this.gui.add(this, 'coloredMap');
        document.getElementById('canvas-cm').style.display = options.cm ? 'block' : 'none'
        cm.onChange((show) => {
            document.getElementById('canvas-cm').style.display = show ? 'block' : 'none'
        })
        let tm = this.gui.add(this, 'three3dMap');
        tm.onChange((show) => {
            document.getElementById('canvas-3d').style.display = show ? 'block' : 'none'
            this.generator.renderer3d = show
            if (show) {
                this.generator.animate3d()
            }
        })
        if (options.seed !== false) {
            this.seed = options.seed
            let seed = this.gui.add(this, 'seed').min(0).step(1);
            seed.onChange((seed) => {
                this.generator.setSeed(seed)
            })
        }
        this.gui.add(this, 'Generate');
    }
}

export default class Game {
    constructor() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        this.seed = seed
        this.renderer3d = true
        let controls = new Controls(this)

        let proxy = new Proxy(controls, {
            get(target, prop) {
                //   debugger;
                return target[prop];
            },
            set(target, prop, value) {
                // debugger
                target[prop] = value;
                return true;
            }
        });
        controls.setProxy(proxy)

        this.startGeneration()
    }

    setSeed(newSeed) {
        seed = newSeed
        this.seed = seed
    }

    startGeneration() {
        generatorWorker.onmessage = (event) => {
            this.drawArea(event.data)
        };
        generatorWorker.postMessage({
            type: 'GENERATE',
            seed: this.seed
        })
    }

    drawArea(area) {
        this.colored = false
        this.drawToCanvas('canvas-hm')
        this.fillArea(area)
        //draw colored map
        this.colored = true
        this.drawToCanvas('canvas-cm')
        this.fillArea(area)

        // this.threeScene(area)

        three3DWorker.onmessage = (e) => {
            const type = e.data
            switch (type) {
                case 'STATS_BEGIN':
                    this.stats.begin()
                    break
                case 'STATS_END':
                    this.stats.end()
                    break
            }
        };

        if (offscreen.width > 0) {
            three3DWorker.postMessage({
                type: 'DRAW',
                canvas: offscreen,
                area: area
            }, [offscreen])
        } else {
            three3DWorker.postMessage({
                type: 'DRAW',
                area: area
            })
        }
    }

    drawToCanvas(cId) {
        const canvas = document.getElementById(cId)
        canvas.width = options.size
        canvas.height = options.size
        this.ctx = canvas.getContext('2d')
    }

    drawBox(x, y, fillColor) {
        this.ctx.fillStyle = fillColor
        this.ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize)
    }

    getColor(floatColor) {
        const c = Math.round(floatColor * 255)
        const fillColor = this.colored ? colorize(c) : 'rgb(' + c + ',' + c + ',' + c + ')'
        return fillColor
    }

    fillArea(area) {
        const cells = options.cells
        for (let y = 0; y < cells; y++) {
            for (let x = 0; x < cells; x++) {
                this.drawBox(x, y, this.getColor(area[y][x]))
            }
        }
    }
}