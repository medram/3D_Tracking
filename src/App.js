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
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { Circle, getRotationBetween, Print, projectOnR1 } from './utils'
import Mouse from './mouse'
import Skeleton from './skeleten'


const WIDTH = 640   // in px
const HEIGHT = 480  // in px
const MOUSE = new Mouse()

let LANDMARKS = []

let CurrentRot = null
let CurrentRot2 = null

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
        this.controls = null

        this.circles = new Array(33).fill(0).map(() => new Circle())
        this.skeleton = null


        this.animate = this.animate.bind(this)
    }

    componentDidMount()
    {
        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.setSize(WIDTH, HEIGHT)

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xa0a0a0)
        //this.scene.fog = new THREE.Fog(0xa0a0a0, 3, 50)

        // set up a perspective camera
        this.camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000)

        // adding controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        //this.controls.object.position.set(0.562, 4.306, 7.844)
        //this.controls.target = new THREE.Vector3(-0.031, -0.065, -0.997)

        //this.camera.position.set(-1, 2, 10)
        this.camera.position.set(0.562, 4.306, 7.844)
        this.camera.lookAt(-0.031, -0.065, -0.997)
        this.controls.update()



        // appending Three DOM element.
        this.mount.appendChild(this.renderer.domElement)
        this.canvas = this.mount.children[0]



        // get mouse sceen positions (-1, +1)
        /*this.mouse = new THREE.Vector3(
            this.canvas.offsetWidth / (MOUSE._x - this.canvas.offsetLeft) * 2 - 1,
            this.canvas.offsetHeight / (MOUSE._y - this.canvas.offsetTop) * -2 + 1,
            -1
        ).unproject(this.camera)*/


        /*
        let objLoader = new OBJLoader()
        objLoader.load('assets/3d/maleBaseBody.obj', (obj) => {
            console.log(obj)
            obj.position.set(-3, 0, 0)
            obj.scale.set(3, 3, 3)
            obj.castShadow = true
            obj.receiveShadow = true
            this.scene.add(obj)

        }, undefined, error => {
            console.error(error)
        })
        */

        let fbxLoader = new FBXLoader()
        fbxLoader.load('assets/3d/Samba_Dancing.fbx', (fbx) => {
            fbx.name = 'Samba_Dancing'
            console.log(fbx)
            fbx.position.set(-5, 0, 0)
            fbx.scale.set(0.05, 0.05, 0.05)
            fbx.castShadow = true
            fbx.receiveShadow = true
            this.scene.add(fbx)


            this.scene.traverse((child) => {
                if (child.name)
                {
                    console.log('Found it :D', child)
                }
            })

        }, undefined, error => {
            console.error(error)
        })

        // loading modules
        let loader = new GLTFLoader()
        loader.load('assets/3d/fire_fighter/scene.gltf', gltf => {
            this.model = gltf

            // adding Axes to the scene
            this.model.scene.add(new THREE.AxesHelper(1))

            // Adding axes helper for bones
            for (let [key, value] of gltf.parser.associations) {
                if (key instanceof THREE.Bone)
                {
                    //console.log(key)
                    key.add(new THREE.AxesHelper(0.13))
                }
            }


            // adding model to the sceen
            this.scene.add(this.model.scene)
            // adding a skeleton helper
            this.scene.add(new THREE.SkeletonHelper(this.model.scene))


            console.log(this.model)


            this.animate()
        }, undefined, error => {
            console.error(error)
        })

        /*
        const u = new THREE.Vector3(0, 1, 0)
        const v = new THREE.Vector3(0, 0, -1)
        let q = getRotationBetween(u, v)
        console.log(q)
        console.log(new THREE.Quaternion().setFromUnitVectors(u, v))
        */

        /*
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        let cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube)

        // adding the all circles to the scene
         this.circles.forEach(circle => {
             this.scene.add(circle)
         })
        */

        // create a 3D object (it should be here)
        console.log('Creating a Skeleton')
        this.skeleton = new Skeleton(LANDMARKS.poseLandmarks)
        this.skeleton.model.translateX(3)
        this.skeleton.model.translateZ(1)
        this.skeleton.model.scale.set(1.5, 1.5, 1.5)
        this.scene.add(this.skeleton.model)

        // adding some lighting
        const light = new THREE.AmbientLight(0xFFFFFF)
        //this.scene.add(light)

        // adding a Himosphare light
        const hemLight = new THREE.HemisphereLight(0x999999, 0x444444)
        hemLight.position.set(0, 200, 0)
        this.scene.add(hemLight)

        // adding a Directional Light
        const dirLight = new THREE.DirectionalLight(0xffffff)
        dirLight.position.set(0, 200, 100)
        dirLight.castShadow = true
        dirLight.shadow.camera.top = 180
        dirLight.shadow.camera.buttom = -100
        dirLight.shadow.camera.left = -120
        dirLight.shadow.camera.right = 120
        this.scene.add(dirLight)

        /*
        //Set up shadow properties for the light
        directionalLight.shadow.mapSize.width = 512; // default
        directionalLight.shadow.mapSize.height = 512; // default
        directionalLight.shadow.camera.near = 0.5; // default
        directionalLight.shadow.camera.far = 500; // default
        */


        // adding Axes to the scene
        const axesHelper = new THREE.AxesHelper(5)
        this.scene.add(axesHelper)

        // adding a floor
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: false })
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2
        floor.receiveShadow = true
        this.scene.add(floor);


        // adding a grid helper
        const gridHelper = new THREE.GridHelper(100, 30, 0x000000, 0x000000)
        gridHelper.position.y += 0.0001
        gridHelper.material.opacity = 0.2
        gridHelper.material.transparent = true
        this.scene.add(gridHelper)


        // Start the animation loop (all 3d models should be loaded before.)
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

        */
        // Look at camera vector
        //Print.try(new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion))
        //Print.try(this.camera.position)

        if (LANDMARKS.poseLandmarks)
        {
            // just update the skeleton coordinates
            this.skeleton.update(LANDMARKS.poseLandmarks)
            const convertedLandmarks = this.skeleton.getConvertedLandmarks()

            //this.skeleton.model.position.copy(LANDMARKS.poseLandmarks[0])
            //this.skeleton.model.rotation.y += 0.05
            //this.skeleton.model.position.x += 0.01

            const VarmL = convertedLandmarks[13].clone().sub(convertedLandmarks[11].clone()).normalize()
            const VforearmL = convertedLandmarks[15].clone().sub(convertedLandmarks[13].clone()).normalize()
            const VarmR = convertedLandmarks[14].clone().sub(convertedLandmarks[12].clone()).normalize()
            const VforearmR = convertedLandmarks[16].clone().sub(convertedLandmarks[14].clone()).normalize()
            const VShoulderL = convertedLandmarks[11].clone().sub(convertedLandmarks[12].clone()).normalize()
            const VShoulderR = convertedLandmarks[12].clone().sub(convertedLandmarks[11].clone()).normalize()
            const VLegR = convertedLandmarks[26].clone().sub(convertedLandmarks[24].clone()).normalize()
            const VLegL = convertedLandmarks[25].clone().sub(convertedLandmarks[23].clone()).normalize()
            const VForeLegR = convertedLandmarks[28].clone().sub(convertedLandmarks[26].clone()).normalize()
            const VForeLegL = convertedLandmarks[27].clone().sub(convertedLandmarks[25].clone()).normalize()
            const VFootL = convertedLandmarks[31].clone().sub(convertedLandmarks[27].clone()).normalize()
            const VFootR = convertedLandmarks[32].clone().sub(convertedLandmarks[28].clone()).normalize()


            this.scene.traverse((child) => {
                return false
                //Print.try(child)
                if (child.name === 'Body001_Fire_Fighter_0' && child instanceof THREE.SkinnedMesh)
                {
                    //Print.try(child)
                    //const u = new THREE.Vector3(1, 0, 0).normalize()
                    //const v = new THREE.Vector3(0, 0, 1).normalize()
                    /*
                    if (CurrentRot == null)
                    {
                        CurrentRot = child.skeleton.bones[12].quaternion.clone()
                    }*/



                    child.skeleton.bones.forEach((bone, i) => {

                        if (i === 12)
                        {
                            // UP vector in R1
                            const u = bone.up.clone()
                            // point M should be converted to R1
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VarmL.clone(), cur).normalize()
                            //const v = projectOnR1(VarmL.clone(), bone.quaternion).normalize()
                            //const v = bone.worldToLocal(new THREE.Vector3(0, 0, 1)).applyQuaternion(bone.quaternion).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                            //bone.rotation.x = -Math.PI / 3

                            //bone.lookAt(bone.worldToLocal(new THREE.Vector3(0, 1, 0)))
                        }
                        else if (i === 13)
                        {
                            //Print.try(VforearmL.clone())
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VforearmL.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        else if (i === 14)
                        {
                            /*
                            const u = bone.up.clone()
                            //const v = .applyQuaternion(bone.parent.quaternion).normalize()
                            const v = projectOnR1(new THREE.Vector3(0, 0, -1), bone.parent.quaternion).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.copy(rot)
                            //bone.rotation.y += 0.01
                            //bone.rotation.x += 0.01
                            */
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VforearmL.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        else if (i === 31)
                        {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VarmR.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        else if (i === 32)
                        {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VforearmR.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        else if (i === 49)
                        {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VLegL.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        else if (i === 50)
                        {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VForeLegL.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        else if (i === 53) {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VLegR.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        else if (i === 54) {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VForeLegR.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        // 56 / 55
                        else if (i === 56) {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VFootR.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        // 52 / 51
                        else if (i === 52) {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VFootL.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        else if (i === 11) {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VShoulderL.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }
                        else if (i === 30) {
                            const u = bone.up.clone()
                            let cur = new THREE.Quaternion()
                            bone.getWorldQuaternion(cur)
                            const v = projectOnR1(VShoulderR.clone(), cur).normalize()
                            const rot = new THREE.Quaternion().setFromUnitVectors(u, v)
                            bone.quaternion.multiply(rot)
                        }

                    })

                }
            })
        }




        // Head_05 & Shoulderr_029 & Shoulderl_010
        for (let [bone, value] of this.model.parser.associations) {
            if (bone.type === 'Bone' && bone.name === 'Head_05') {
                //bone.position.copy(new THREE.Vector3(0, 0.06, 0))
                //bone.up.copy(new THREE.Vector3(0.5, 0.5, 0))
                //bone.rotation.y = -1
                //bone.rotation.x = 0
                //bone.rotation.z = 0
                //bone.quaternion.copy(new THREE.Quaternion(0, 0.2, 0, -1))
            }
            /*
            else if (bone.type === 'Bone' && bone.name === 'Shoulderl_010'){
                bone.position.copy(convertedLandmarks[11])
            }
            else if (bone.type === 'Bone' && bone.name === 'Arml_011'){
                bone.position.copy(convertedLandmarks[14])
            }
            else if (bone.type === 'Bone' && bone.name === 'ForeArml_012'){
                bone.position.copy(convertedLandmarks[0])
            }
            else if (bone.type === 'Bone' && bone.name === 'Handl_013'){
                bone.position.copy(convertedLandmarks[15])
            }
            else if (bone.type === 'Bone' && bone.name === 'Shoulderr_029'){
                bone.position.copy(convertedLandmarks[12])
            }
            else if (bone.type === 'Bone' && bone.name === 'Handr_032'){
                bone.position.copy(convertedLandmarks[16])
            }
            else if (bone.type === 'Bone' && bone.name === 'Armr_030'){
                bone.position.copy(convertedLandmarks[13])
            }*/

        }







        //this.model.scene.rotation.y += 0.01
        //console.log(this.model.scene.position.z)
        //this.model.scene.position.z -= 0.01

        this.controls.update()
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
