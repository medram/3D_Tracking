import * as THREE from 'three'

export default class Mouse {
    constructor() {
        this.vector = new THREE.Vector2()
        this._x = 0
        this._y = 0
        this._time = 0
        this._delta = 0
        this._fps = 60
        this._init()
    }

    _init() {
        this._time = new Date().getTime()
        document.onmousemove = (e) => {
            this.delta = new Date().getTime() - this._time
            if (this.delta > 1000 / this._fps)
                this._update(e.clientX, e.clientY)
                //this._update(e.pageX, e.pageY)
        }
    }

    _update(x, y)
    {
        this._x = x;
        this._y = y;

        this.vector.x = x / window.innerWidth * 2 - 1;
        this.vector.y = -( y / window.innerHeight ) * 2 + 1;

        this._delta = 0
        this._time = new Date().getTime()
        //console.log('mouse moved')
    }

}
