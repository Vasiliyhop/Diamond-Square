let stone = THREE.ImageUtils.loadTexture("../stone.png")
let grass = THREE.ImageUtils.loadTexture("../grass.png")
let dirt = THREE.ImageUtils.loadTexture("../dirt.jpg")
let sand = THREE.ImageUtils.loadTexture("../sand.png")
let water = THREE.ImageUtils.loadTexture("../water.jpg")
export const materials = [
    // new THREE.MeshPhongMaterial( { color: 'blue', dithering: true } ),
    new THREE.MeshPhongMaterial( { map: water, dithering: true } ),
    new THREE.MeshPhongMaterial( { map: sand, dithering: true } ),
    new THREE.MeshPhongMaterial( { map: dirt, dithering: true } ),
    new THREE.MeshPhongMaterial( { map: grass, dithering: true } ),
    new THREE.MeshPhongMaterial( { map: stone, dithering: true } ),
]