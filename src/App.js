import React from 'react'
import './App.css'
import {
    Pose,
    POSE_LANDMARKS_NEUTRAL,
    POSE_LANDMARKS_RIGHT,
    POSE_LANDMARKS_LEFT,
    POSE_CONNECTIONS
} from '@mediapipe/pose/pose'
import { Camera } from '@mediapipe/camera_utils/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils/drawing_utils'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Mouse from './mouse'



const WIDTH = 640   // in px
const HEIGHT = 480  // in px
const MOUSE = new Mouse()

let LANDMARKS = []
/*
function getSceneToWorld(dx, dy)
{
    let projector = new THREE.Projector();
    let mouse3D = new THREE.Vector3(dx / window.innerWidth * 2 - 1, -dy / window.innerHeight * 2 + 1, 0.5);
    projector.unprojectVector(mouse3D, camera);
    mouse3D.sub(camera.position);
    mouse3D.normalize();

    let rayCaster = new THREE.Raycaster(camera.position, mouse3D);
    let scale = window.innerWidth * 2;
    let rayDir = new THREE.Vector3(rayCaster.ray.direction.x * scale, rayCaster.ray.direction.y * scale, rayCaster.ray.direction.z * scale);
    let rayVector = new THREE.Vector3(camera.position.x + rayDir.x, camera.position.y + rayDir.y, camera.position.z + rayDir.z);
    return rayVector;
}
*/

function clamp(x, a, b)
{
    return Math.min(Math.max(x, a), b);
}

function zColor(data)
{
    const z = clamp(data.from.z + 0.5, 0, 1)
    return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`
}



class Render3D extends React.Component
{
    constructor(props)
    {
        super(props)
        this.scene = null
        this.camera = null
        this.renderer = null
        this.model = null

        this.animate = this.animate.bind(this)
    }

    componentDidMount()
    {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000)
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(WIDTH, HEIGHT)

        this.scene.background = new THREE.Color(0xcccccc)

        // appending Three DOM element.
        this.mount.appendChild(this.renderer.domElement)

        // loading modules
        let loader = new GLTFLoader()
        loader.load('assets/3d/fire_fighter/scene.gltf', gltf => {
            this.model = gltf
            this.scene.add(gltf.scene)
            console.log(gltf.parser)
            // Shoulderl_010 & Arml_011
            for (let [key, value] of gltf.parser.associations)
            {
                console.log(key)
            }

            this.animate()
        }, undefined, error => {
            console.error(error)
        })


        /*
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        let cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube)
        */

        // adding some lighting
        const light = new THREE.AmbientLight(0xEEEEEE)
        this.scene.add(light)

        // Start the animation loop (all 3d models should be loaded before.)
        this.camera.position.z = 3
        this.camera.position.y = 0
        //this.animate()
    }

    animate()
    {
        // mouse position in the 3d world.
        let Mouse3D = MOUSE.vector


        this.model.scene.position.x = Mouse3D.x
        this.model.scene.position.y = Mouse3D.y
        //this.model.scene.position.z = Mouse3D.z

        for (let [key, value] of this.model.parser.associations) {
            /*
            if (key.type === 'Bone' && key.name === 'Arml_011') {
                key.rotation.z += 0.01
            }
            */
            if (key.type === 'Bone' && key.name === 'ForeArml_012') {

                try {
                    //let pose = LANDMARKS.poseLandmarks[13]
                    // Vector3 {x: 1.8917489796876907e-10, y: 0.1924258917570114, z: -5.961614846228258e-8}
                    //console.log(MOUSE)


                    //key.position.x = v.x
                    //key.position.y = v.y
                    //key.position.z = v.y
                } catch (error) {
                    //console.log('poseLandmarks[15] Not found')
                }
            }
        }


        //this.model.scene.rotation.y += 0.01
        //console.log(this.model.scene.position.z)
        //this.model.scene.position.z -= 0.01

        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.animate)
    }

    render()
    {
        return <div ref={ref => (this.mount = ref)} />
    }
}


class App extends React.Component
{
    constructor(props)
    {
        super(props)
        this.video = null
        this.canvas = null
        this.ctx = null
        this.pose = null
        this.camera = null

        this.onResults = this.onResults.bind(this)
        this.renderLandmarks = this.renderLandmarks.bind(this)
    }

    async componentDidMount()
    {
        this.video = document.querySelector('#video_input')
        this.canvas = document.querySelector('#output_canvas')
        this.ctx = this.canvas.getContext('2d')

        this.pose = new Pose({
            locateFile: (file) => {
                return `assets/js/${file}`
                //return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
            }
        })

        this.pose.setOptions({
            upperBodyOnly: false,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        })

        this.pose.onResults(this.onResults)

        this.camera = new Camera(this.video, {
            onFrame: async () => {
                await this.pose.send({image: this.video})
            },
            width: WIDTH,
            height: HEIGHT,
        })

        this.camera.start()
    }

    onResults(results)
    {
        // asign results to accessable everywere (make it global)
        LANDMARKS = results
        /*
        {
            "image": canvasimage,
            "poseLandmarks": [
                {
                    "x": 0.46757373213768005,
                    "y": 0.36282193660736084,
                    "z": -0.2994067668914795,
                    "visibility": 1
                },
                ...
            ]
        }
        */
        //results.poseLandmarks[11]
        //results.poseLandmarks[13]
        //results.poseLandmarks[15]

        // render landmarks
        this.renderLandmarks(results)
    }

    renderLandmarks(results)
    {
        this.ctx.save()
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height)

        drawConnectors(this.ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#FFFFFF', lineWidth: 1 })
        drawLandmarks(this.ctx, results.poseLandmarks, { color: '#FFFF00', lineWidth: 1 });
        /*
        drawConnectors(
            this.ctx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: (data) => {
                const x0 = this.canvas.width * data.from.x;
                const y0 = this.canvas.height * data.from.y;
                const x1 = this.canvas.width * data.to.x;
                const y1 = this.canvas.height * data.to.y;

                const z0 = clamp(data.from.z + 0.5, 0, 1);
                const z1 = clamp(data.to.z + 0.5, 0, 1);

                const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1);
                gradient.addColorStop(0, `rgba(0, ${255 * z0}, ${255 * (1 - z0)}, 1)`);
                gradient.addColorStop(1.0, `rgba(0, ${255 * z1}, ${255 * (1 - z1)}, 1)`);
                return gradient;
            }
        });

        /*
        drawLandmarks(this.ctx, Object.values(POSE_LANDMARKS_LEFT).map(index => results.poseLandmarks[index]),
            { color: zColor, fillColor: '#FF0000' })

        drawLandmarks(this.ctx, Object.values(POSE_LANDMARKS_RIGHT).map(index => results.poseLandmarks[index]),
            { color: zColor, fillColor: '#00FF00' })

        drawLandmarks(this.ctx, Object.values(POSE_LANDMARKS_NEUTRAL).map(index => results.poseLandmarks[index]),
            { color: zColor, fillColor: '#AAAAAA' })
        */
        this.ctx.restore()
    }

    render()
    {
        return <>
            <Render3D />
            <canvas id='output_canvas' width={WIDTH} height={HEIGHT}></canvas>
            <video id='video_input' width={WIDTH} height={HEIGHT}></video>
        </>
    }
}

export default App;
