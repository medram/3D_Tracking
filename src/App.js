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
import { Circle, PrintInAnimation } from './utils'



const WIDTH = 640   // in px
const HEIGHT = 480  // in px
const MOUSE = new Mouse()
const Print = new PrintInAnimation(1)

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
        this.mouse = null
        this.canvas = null

        this.circles = new Array(33).fill(0).map(() => new Circle())

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
        this.canvas = this.mount.children[0]

        // get mouse sceen positions (-1, +1)
        /*this.mouse = new THREE.Vector3(
            this.canvas.offsetWidth / (MOUSE._x - this.canvas.offsetLeft) * 2 - 1,
            this.canvas.offsetHeight / (MOUSE._y - this.canvas.offsetTop) * -2 + 1,
            -1
        ).unproject(this.camera)*/


        // loading modules
        let loader = new GLTFLoader()
        loader.load('assets/3d/fire_fighter/scene.gltf', gltf => {
            this.model = gltf
            //this.scene.add(gltf.scene)
            console.log(gltf)
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
       // adding the all circles to the scene
        this.circles.forEach(circle => {
            this.scene.add(circle)
        })

        // adding some lighting
        const light = new THREE.AmbientLight(0xEEEEEE)
        this.scene.add(light)

        // adding Axes to the scene
        const axesHelper = new THREE.AxesHelper(5)
        this.scene.add(axesHelper)

        // Start the animation loop (all 3d models should be loaded before.)
        this.camera.position.x = 2
        this.camera.position.y = 1
        this.camera.position.z = 2
        //this.animate()
    }

    animate()
    {
        // get mouse sceen positions (-1, +1)
        /*
        this.mouse = new THREE.Vector3(
            (MOUSE._x - this.canvas.offsetLeft) / this.canvas.offsetWidth * 2 - 1,
            -(MOUSE._y - this.canvas.offsetTop) / this.canvas.offsetHeight * 2 + 1,
            0.5
        ).unproject(this.camera)

        Print.try(this.mouse)
        */

        //this.model.scene.position.x = this.mouse.x
        //this.model.scene.position.y = this.mouse.y
        //this.model.scene.position.z = this.mouse.z


        if (LANDMARKS.poseLandmarks)
        {
            LANDMARKS.poseLandmarks.forEach((pose, i) => {
                let v = new THREE.Vector3(pose.x, pose.y, pose.z)

                // convert to the sceen space
                v.x = v.x * 2 - 1
                v.y = -v.y * 2 + 1
                v.z = 0.5

                // convert to 3D world
                v.unproject(this.camera)
                //this.model.scene.worldToLocal(v)
                // Print.try(this.circles.length)
                // appending circles positions
                this.circles[i].position.copy(new THREE.Vector3(v.x, v.y, v.z))
            })
        }




        // Head_05 & Shoulderr_029 & Shoulderl_010
        /*
        for (let [key, value] of this.model.parser.associations) {
            if (key.type === 'Bone' && (key.name === 'Head_05' || key.name === 'Shoulderl_010' || key.name === 'Shoulderr_029' )) {
            }

        }
        */

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
        //Print.try(results.poseLandmarks[15])

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
