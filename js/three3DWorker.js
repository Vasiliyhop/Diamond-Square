let options, canvas, scene, mergedGeometry, renderer, area, animationFrameREF
self.importScripts( '../libs/three.js' );
class Fix{}
self.HTMLImageElement = Fix
self.HTMLCanvasElement = Fix
self.ImageBitmap = Fix
const materialIndex = (c) => {
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

let loader = new THREE.ImageBitmapLoader()
let textures = {
    water: '../textures/water.jpg',
    sand: '../textures/sand.png',
    dirt: '../textures/dirt.jpg',
    grass: '../textures/grass.png',
    stone: '../textures/stone.png'
}
let promises = []
let materials
const loadTextures = () => {
    for (let key in textures) {
        let promise = new Promise(function(resolve) {
            loader.load(
                textures[key],
                ( texture ) => {
                    resolve(texture)
                })
        })
        promises.push(promise)
    }
    Promise.all(promises).then((textures) => {
        materials = [
            // new THREE.MeshPhongMaterial( { color: 'blue', dithering: true } ),
            new THREE.MeshPhongMaterial( { map: new THREE.CanvasTexture( textures[0] ), dithering: true } ),
            new THREE.MeshPhongMaterial( { map: new THREE.CanvasTexture( textures[1] ), dithering: true } ),
            new THREE.MeshPhongMaterial( { map: new THREE.CanvasTexture( textures[2] ), dithering: true } ),
            new THREE.MeshPhongMaterial( { map: new THREE.CanvasTexture( textures[3] ), dithering: true } ),
            new THREE.MeshPhongMaterial( { map: new THREE.CanvasTexture( textures[4] ), dithering: true } ),
        ]
        threeScene()
    })
}

const clearScene = (scene) => {
    while (scene.children.length > 0) {
        let obj = scene.children[0]
        if (obj.geometry) {
            obj.geometry.dispose();
        }
        if (obj.material) {
            if (obj.material.length) {
                obj.material.forEach((material) => {
                    if (material.map) {
                        material.map.dispose();
                    }
                    material.dispose();
                })
            } else {
                if (obj.material.map) {
                    obj.material.map.dispose();
                }
                obj.material.dispose()
            }
        }
        if (obj.dispose) {                                                                                     
            obj.dispose();                                                                                       
        }
        obj.vertices = [];
        obj.faceVertexUvs = [];
        obj.faces = [];
        scene.remove( obj );
        obj = null
    }
}

const threeScene = () => {
    let cubeGeometry = new THREE.BoxGeometry(1,1,1)
    let cube = new THREE.Mesh(cubeGeometry)
    if (scene) {
        clearScene(scene)
    } else {
        scene = new THREE.Scene()
        scene.autoUpdate = true
    }

    scene.background = new THREE.Color( 0x8080ff );

    const normalizeCoeficient = options.elevation
    if (mergedGeometry) {
        //Trying to clear memory
        mergedGeometry.dispose();
        mergedGeometry.vertices = [];
        mergedGeometry.faceVertexUvs[0] = []
        mergedGeometry.faces = [];
        mergedGeometry.__directGeometry.normals = []
        mergedGeometry.__directGeometry.colors = []
        mergedGeometry.__directGeometry.vertices = []
        mergedGeometry.__directGeometry.uvs = []
        mergedGeometry.__directGeometry.computeGroups(mergedGeometry)
        mergedGeometry._bufferGeometry.attributes.color.array = []
        mergedGeometry._bufferGeometry.attributes.normal.array = []
        mergedGeometry._bufferGeometry.attributes.position.array = []
        mergedGeometry._bufferGeometry.attributes.uv.array = []
        mergedGeometry._bufferGeometry.clearGroups()
        mergedGeometry = new THREE.Geometry()

    } else {
        mergedGeometry = new THREE.Geometry()
    }
    
    cube.matrixAutoUpdate = false;
    cube.geometry.faces.forEach(function(face) {face.materialIndex = 0;});
    
    const createCube = (x,y,z, c) => {
        let index = materialIndex(Math.round(c * 255))
        cube.position.x = x
        cube.position.y = y
        cube.position.z = z

        cube.updateMatrix();
        mergedGeometry.merge(cube.geometry, cube.matrix, index);
        //!!! ATTENTION this.mergedGeometry memory leaking
    }

    for(let y=0; y < area.length; y++) {
        for(let x=0; x < area.length; x++) {
            const hip = area[y][x]
            const height = Math.round(normalizeCoeficient * hip)
            for (let z=0; z <= height; z++) {
                createCube(x - (options.cells / 2),y - (options.cells / 2),z, hip)
            }
        }
    }
    cube.geometry.dispose();
    cube.material.dispose();

    var mergedMesh = new THREE.Mesh(mergedGeometry, materials);

    scene.add(mergedMesh)

    if (animationFrameREF) {
        cancelAnimationFrame(animationFrameREF)
    }

    // if (!renderer) {
        renderer = new THREE.WebGLRenderer({ canvas: canvas });
        // renderer.setSize( options.size, options.size );
        renderer.autoClear = true

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
    // }

    let camera = new THREE.PerspectiveCamera( 75, options.size / options.size, 0.1, 1000 );
    
    let waterLevel = new THREE.MeshPhongMaterial( { color: 'blue', dithering: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide} )
    let waterGeometry = new THREE.PlaneGeometry(options.cells,options.cells,1,1,1)
    let waterMesh = new THREE.Mesh(waterGeometry, waterLevel);

    scene.add(waterMesh)
    waterMesh.position.z = normalizeCoeficient / 4 + 0.625

    //LIGHT
    let spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( 15, 40, 50 );
    spotLight.angle = Math.PI / 2;
    spotLight.penumbra = 0.05;
    spotLight.decay = 2;
    spotLight.distance = 500;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 200;
    scene.add( spotLight );
    //........

    camera.position.set(24,24,24);
    camera.up = new THREE.Vector3(0.25,0.25,1);
    camera.lookAt(new THREE.Vector3(0,0,0));

    animate3d = () => {
        // this.stats.begin()
        postMessage('STATS_BEGIN')

        scene.rotation.z += 0.01;

        renderer.render( scene, camera );
        // if (this.renderer3d) {
            animationFrameREF = requestAnimationFrame( animate3d );
        // }
        // this.stats.end()
        postMessage('STATS_END')
    }
    animate3d();
}

onmessage = function(e) {
    const type = e.data.type

    switch(type) {
        case 'SET_OPTIONS':
            options = e.data.options
            break
        case 'DRAW':
            area = e.data.area
            if (e.data.canvas) {
                canvas= e.data.canvas
            }
            loadTextures()
            break
    }
}