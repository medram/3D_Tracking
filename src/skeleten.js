import * as THREE from 'three'
import { Circle } from './utils'

export default class Skeleton
{
    constructor(landmarks = null, color = 0x0000ff)
    {
        this._landmarks = []
        this._tempLandmarks = landmarks || []
        this.model = new THREE.Group()
        this.color = color
        this._bodyParts = []
        this._skeletonGenerated = false

        this._init()
    }

    _init()
    {
        this._axis = new THREE.AxesHelper(1)
        this.model.add(this._axis)

        this._convertToLocalSpace()
        this._generateSkeleten()
    }

    // convert model coordinates to the local space
    _convertToLocalSpace()
    {
        if (!this._tempLandmarks)
            return null

        // clear the Array (and hopefully not to create a new one)
        this._landmarks.splice(0, this._landmarks.length)
        //this._landmarks = []

        this._tempLandmarks.forEach((pose, i) => {
            let v = new THREE.Vector3(pose.x, pose.y, pose.z)

            // convert to the sceen space
            /*
            v.x = v.x * 2 - 1
            v.y = -v.y * 2 + 1
            v.z = 0
            */

            // making the Head as a center of axes model
            v.x = v.x - this._tempLandmarks[0].x
            v.y = -(v.y - this._tempLandmarks[0].y)
            v.z = -(v.z - this._tempLandmarks[0].z)

            this._landmarks.push(v)
        })
    }

    _generateSkeleten()
    {
        if (this._landmarks.length)
        {
            this.model.add(this._generateHead())
            this.model.add(this._generateSquareBody())
            this.model.add(this._generateLeftArm())
            this.model.add(this._generateRightArm())
            this.model.add(this._generateLeftLeg())
            this.model.add(this._generateRightLeg())

            this._worldToLoacal()
            this._skeletonGenerated = true
        }
    }

    _worldToLoacal()
    {
        return null
        this._landmarks = this._landmarks.map(v => {
            // convert to 3D world

            return this.model.worldToLocal(v.unproject(this._camera))
        })
    }
    _generateLeftArm()
    {
        let material = new THREE.LineBasicMaterial({ color: this.color })
        let geometry = new THREE.BufferGeometry().setFromPoints([
            this._landmarks[11],
            this._landmarks[13],
            this._landmarks[15]
        ])
        let mesh = new THREE.Line(geometry, material)
        mesh.name = 'LeftArm'
        return mesh
    }

    _generateRightArm() {
        let material = new THREE.LineBasicMaterial({ color: this.color })
        let geometry = new THREE.BufferGeometry().setFromPoints([
            this._landmarks[12],
            this._landmarks[14],
            this._landmarks[16]
        ])

        let mesh = new THREE.Line(geometry, material)
        mesh.name = 'RightArm'
        return mesh
    }

    _generateSquareBody()
    {
        let material = new THREE.LineBasicMaterial({ color: this.color })
        let geometry = new THREE.BufferGeometry().setFromPoints([
            this._landmarks[12],
            this._landmarks[11],
            this._landmarks[23],
            this._landmarks[24],
            this._landmarks[12]
        ])

        let mesh = new THREE.Line(geometry, material)
        mesh.name = 'SquareBody'
        return mesh
    }

    _generateLeftLeg() {
        let material = new THREE.LineBasicMaterial({ color: this.color })
        let geometry = new THREE.BufferGeometry().setFromPoints([
            this._landmarks[23],
            this._landmarks[25],
            this._landmarks[27]
        ])

        let mesh = new THREE.Line(geometry, material)
        mesh.name = 'LeftLeg'
        return mesh
    }

    _generateRightLeg() {
        let material = new THREE.LineBasicMaterial({ color: this.color })
        let geometry = new THREE.BufferGeometry().setFromPoints([
            this._landmarks[24],
            this._landmarks[26],
            this._landmarks[28]
        ])

        let mesh = new THREE.Line(geometry, material)
        mesh.name = 'RightLeg'
        return mesh
    }

    _generateHead()
    {
        let head = new Circle(0.1, 20, this.color)
        head.position.copy(this._landmarks[0])
        head.name = 'Head'
        return head
    }

    getModel()
    {
        return this.model
    }

    update(tempLandmarks)
    {
        if (!this._skeletonGenerated)
            this._generateSkeleten()

        // convert coordinates to local space
        this._tempLandmarks = tempLandmarks
        this._convertToLocalSpace()

        // Updating body parts models
        this.model.children.forEach(bodyPart => {

            if (bodyPart.name === 'Head')
            {
                bodyPart.position.copy(this._landmarks[0])
            }
            else if (bodyPart.name === 'LeftArm')
            {
                bodyPart.geometry.setFromPoints([
                    this._landmarks[11],
                    this._landmarks[13],
                    this._landmarks[15]
                ])
            }
            else if (bodyPart.name === 'RightArm')
            {
                bodyPart.geometry.setFromPoints([
                    this._landmarks[12],
                    this._landmarks[14],
                    this._landmarks[16]
                ])
            }
            else if (bodyPart.name === 'SquareBody') {
                bodyPart.geometry.setFromPoints([
                    this._landmarks[12],
                    this._landmarks[11],
                    this._landmarks[23],
                    this._landmarks[24],
                    this._landmarks[12]
                ])
            }
            else if (bodyPart.name === 'LeftLeg') {
                bodyPart.geometry.setFromPoints([
                    this._landmarks[23],
                    this._landmarks[25],
                    this._landmarks[27]
                ])
            }
            else if (bodyPart.name === 'RightLeg') {
                bodyPart.geometry.setFromPoints([
                    this._landmarks[24],
                    this._landmarks[26],
                    this._landmarks[28]
                ])
            }
        })
        // convert coordinates to local space
        this._worldToLoacal()
    }
}
