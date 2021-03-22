import React from 'react';
import './App.css';


class Camera extends React.Component {
    constructor(props) {
        super(props)
        //this.video = React.createRef()
        this.video = null
        this.stream = null
    }

    async getStream() {
        if (!this.stream) {
            return await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                }
            }).then(stream => {
                this.video.srcObject = stream
                this.stream = stream
                return stream
            }).catch(err => {
                console.log('Error: ' + err)
                return null
            })
        }
        return this.stream
    }

    async assignToPlayer() {
        //console.log(this.video)
        console.log(await this.getStream())
        //this.video.src = URL.createObjectURL(await this.getStream())
    }

    checkDevice() {
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)
            return true
        return false
    }

    componentDidMount() {
        this.video = document.querySelector('video')
        this.assignToPlayer()
    }

    render() {
        return (
            <>
                <h1>Camera</h1>
                <video autoPlay></video>
            </>
        )
    }
}


function App(props) {
    return <Camera />
}

export default App;

