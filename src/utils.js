import * as THREE from 'three'

export class PrintInAnimation {
    constructor(fps=60) {
        this._time = new Date().getTime()
        this._delta = 0
        this._fps = fps
    }

    try(value) {
        this._delta = new Date().getTime() - this._time
        if (this._delta > 1000 / this._fps){
            if (typeof value === 'function')
                value()
            else
                console.log(value)
            this._delta = 0
            this._time = new Date().getTime()
        }
    }
}


export const Print = new PrintInAnimation(1)


export function Circle(radius = 0.01, segments = 10, color = 0xffff00)
{
    const geometry = new THREE.CircleGeometry(radius, segments);
    const material = new THREE.MeshBasicMaterial({ color: color });
    return new THREE.Mesh(geometry, material);
}


export function getRotationBetween(u, v)
{
    u = u.clone().normalize()
    v = v.clone().normalize()

    if (u.equals(v.clone().multiplyScalar(-1)))
    {
        let a = orthogonal(u)
        return new THREE.Quaternion(a.x, a.y, a.z, 0)
    }

    let half = u.clone().add(v).normalize()
    let a = u.clone().cross(half)
    return new THREE.Quaternion(a.x, a.y, a.z, u.dot(half))
}


export function orthogonal(v)
{
    let up = new THREE.Vector3(0, 1, 0)
    let v2 = v.clone().cross(up)
    return v.clone().cross(v2).normalize()
}

export function projectOnR1(m, q) {
    let i = new THREE.Vector3(1, 0, 0).applyQuaternion(q).normalize()
    let j = new THREE.Vector3(0, 1, 0).applyQuaternion(q).normalize()
    let k = new THREE.Vector3(0, 0, 1).applyQuaternion(q).normalize()

    //Print.try(m.dot(i))

    return new THREE.Vector3(m.clone().dot(i), m.clone().dot(j), m.clone().dot(k))
}
