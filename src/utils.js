
export class PrintInAnimation {
    constructor(fps=60) {
        this._time = new Date().getTime()
        this._delta = 0
        this._fps = fps
    }

    try(value) {
        this._delta = new Date().getTime() - this._time
        if (this._delta > 1000 / this._fps){
            console.log(value)
            this._delta = 0
            this._time = new Date().getTime()
        }
    }
}


