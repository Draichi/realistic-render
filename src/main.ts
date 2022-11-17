import './style.css'
import * as THREE from 'three'
import GUI from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import nx from '/environmentMaps/6/nx.png'
import ny from '/environmentMaps/6/ny.png'
import nz from '/environmentMaps/6/nz.png'
import px from '/environmentMaps/6/px.png'
import py from '/environmentMaps/6/py.png'
import pz from '/environmentMaps/6/pz.png'

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

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMaps = cubeTextureLoader.load([px, nx, py, ny, pz, nz])
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

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.physicallyCorrectLights = true

const tick = () => {
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()
