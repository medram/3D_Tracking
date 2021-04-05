import * as THREE from 'three'
import { Circle, Print } from './utils'



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
        this.translation = new THREE.Vector3()

        // these poses are used to get repere position.
        this._poses = [15, 16, 23, 24, 25, 26, 29, 30]
        this._reperePosition = new THREE.Vector3(0, 0, 0)
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

            /*
            // making the Head as a center of axes model
            v.x = v.x - this._tempLandmarks[0].x
            v.y = -(v.y - this._tempLandmarks[0].y)
            v.z = -(v.z - this._tempLandmarks[0].z)
            */

            // make a repere and convert all points/poses to it
            v.sub(this._reperePosition)
            v.y = -v.y
            v.z = -v.z // invert z to get the mirrar effect

            this._landmarks.push(v)
        })
    }

    getConvertedLandmarks()
    {
        return this._landmarks
    }

    _update3DModelPosition()
    {
        let AB = this._landmarks[11].clone().sub(this._tempLandmarks[12])
        //Print.try(AB.length())
        this.model.position.set(
            this.translation.x + this._tempLandmarks[0].x * 1.2, //  * 1.2 just to scale the result
            this.translation.y, // + 0
            this.translation.z + AB.length() * 2 - 1
            )
    }

    // calculate repere position.
    _gererateReperePosition()
    {
        // we want ymin but the repere is up side down, so it's ymax
        let ymax = Math.max(...this._poses.map(i => {
            return this._tempLandmarks[i].y
        }))

        return this._reperePosition.set(this._tempLandmarks[0].x, ymax, this._tempLandmarks[0].z)
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
            this.model.add(this._generateRightFoot())
            this.model.add(this._generateLeftFoot())
            this.model.add(this._generateRightHand())
            this.model.add(this._generateLeftHand())

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

    _generateRightFoot() {
        let material = new THREE.LineBasicMaterial({ color: this.color })
        let geometry = new THREE.BufferGeometry().setFromPoints([
            this._landmarks[28],
            this._landmarks[30],
            this._landmarks[32],
            this._landmarks[28]
        ])

        let mesh = new THREE.Line(geometry, material)
        mesh.name = 'RightFoot'
        return mesh
    }

    _generateLeftFoot() {
        let material = new THREE.LineBasicMaterial({ color: this.color })
        let geometry = new THREE.BufferGeometry().setFromPoints([
            this._landmarks[27],
            this._landmarks[31],
            this._landmarks[29],
            this._landmarks[27]
        ])

        let mesh = new THREE.Line(geometry, material)
        mesh.name = 'LeftFoot'
        return mesh
    }

    _generateRightHand() {
        let material = new THREE.LineBasicMaterial({ color: this.color })
        let geometry = new THREE.BufferGeometry().setFromPoints([
            this._landmarks[16],
            this._landmarks[22],
            this._landmarks[20],
            this._landmarks[18],
            this._landmarks[16]
        ])

        let mesh = new THREE.Line(geometry, material)
        mesh.name = 'RightHand'
        return mesh
    }

    _generateLeftHand() {
        let material = new THREE.LineBasicMaterial({ color: this.color })
        let geometry = new THREE.BufferGeometry().setFromPoints([
            this._landmarks[15],
            this._landmarks[21],
            this._landmarks[19],
            this._landmarks[17],
            this._landmarks[15]
        ])

        let mesh = new THREE.Line(geometry, material)
        mesh.name = 'LeftHand'
        return mesh
    }

    getModel()
    {
        return this.model
    }

    update(tempLandmarks)
    {
        if (!this._skeletonGenerated)
            this._generateSkeleten()

        this._tempLandmarks = tempLandmarks

        // calculate repere position.
        this._gererateReperePosition()

        // convert coordinates to local space
        this._convertToLocalSpace()

        // update 3D model position in the world space
        this._update3DModelPosition()

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
            else if (bodyPart.name === 'RightFoot') {
                bodyPart.geometry.setFromPoints([
                    this._landmarks[28],
                    this._landmarks[30],
                    this._landmarks[32],
                    this._landmarks[28]
                ])
            }
            else if (bodyPart.name === 'LeftFoot') {
                bodyPart.geometry.setFromPoints([
                    this._landmarks[27],
                    this._landmarks[31],
                    this._landmarks[29],
                    this._landmarks[27]
                ])
            }
            else if (bodyPart.name === 'RightHand') {
                bodyPart.geometry.setFromPoints([
                    this._landmarks[16],
                    this._landmarks[22],
                    this._landmarks[20],
                    this._landmarks[18],
                    this._landmarks[16]
                ])
            }
            else if (bodyPart.name === 'LeftHand') {
                bodyPart.geometry.setFromPoints([
                    this._landmarks[15],
                    this._landmarks[21],
                    this._landmarks[19],
                    this._landmarks[17],
                    this._landmarks[15]
                ])
            }
        })
        // convert coordinates to local space
        this._worldToLoacal()
    }
}
