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
