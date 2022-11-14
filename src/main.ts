import './style.css'
import * as THREE from 'three'

const canvas = document.querySelector('canvas#webgl') as HTMLCanvasElement

const scene = new THREE.Scene()

const sphere01 = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial()
)
scene.add(sphere01)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
)
camera.position.set(0, 0, 2)

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)
