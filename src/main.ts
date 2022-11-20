import './style.css'
import * as THREE from 'three'
import GUI from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import nx from '/environmentMaps/3/nx.jpg'
import ny from '/environmentMaps/3/ny.jpg'
import nz from '/environmentMaps/3/nz.jpg'
import px from '/environmentMaps/3/px.jpg'
import py from '/environmentMaps/3/py.jpg'
import pz from '/environmentMaps/3/pz.jpg'

const canvas = document.querySelector('canvas#webgl') as HTMLCanvasElement

const gui = new GUI()
const debug = {
  envMapIntensity: 5,
}

const scene = new THREE.Scene()

const updateAllMeterials = () => {
  scene.traverse((child) => {
    const isMesh = child instanceof THREE.Mesh
    if (!isMesh) {
      return
    }

    const isStandardMaterial =
      child.material instanceof THREE.MeshStandardMaterial
    if (!isStandardMaterial) {
      return
    }

    child.material.envMapIntensity = debug.envMapIntensity

    child.castShadow = true
    child.receiveShadow = true
  })
}
const gltfLoader = new GLTFLoader()
gltfLoader.load(
  '/FlightHelmet/glTF/FlightHelmet.gltf',
  ({ scene: modelScene }) => {
    modelScene.position.set(0, -1.5, 0)
    modelScene.scale.set(4, 4, 4)
    modelScene.rotateY(Math.PI * 1.75)
    scene.add(modelScene)
    updateAllMeterials()

    gui
      .add(modelScene.rotation, 'y')
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.001)
      .name('Model Rotation')
  }
)
gltfLoader.load('/burger.glb', ({ scene: modelScene }) => {
  modelScene.position.set(2, -1.5, 2)
  modelScene.scale.set(0.2, 0.2, 0.2)
  modelScene.visible = false
  scene.add(modelScene)
  gui.add(modelScene, 'visible').name('Show hamburger')
})

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMaps = cubeTextureLoader.load([px, nx, py, ny, pz, nz])
environmentMaps.encoding = THREE.sRGBEncoding
scene.background = environmentMaps
scene.environment = environmentMaps
gui
  .add(debug, 'envMapIntensity')
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMeterials)

const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
directionalLight.position.set(0.25, 3, 2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
scene.add(directionalLight)
gui
  .add(directionalLight, 'intensity')
  .min(0)
  .max(10)
  .step(0.001)
  .name('Light intensity')
gui
  .add(directionalLight.position, 'x')
  .min(-2)
  .max(2)
  .step(0.001)
  .name('Light X position')
gui
  .add(directionalLight.position, 'y')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('Light Y position')
gui
  .add(directionalLight.position, 'z')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('Light Z position')

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)
gui
  .add(directionalLightCameraHelper, 'visible')
  .name('Directional Camera Helper')

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)
camera.position.set(0, 2, 2)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.02

const isAntialiasActivated: boolean = window.devicePixelRatio < 2
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: isAntialiasActivated,
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
gui
  .add(renderer, 'toneMapping', {
    None: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  })
  .name('Tone Mapping Algorithm')
gui
  .add(renderer, 'toneMappingExposure')
  .min(0)
  .max(10)
  .step(0.001)
  .name('Tone Mapping Exposure')

const tick = () => {
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()
