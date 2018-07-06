import socket from './net.js'

console.log('draw.js')

// Canvas 2D Context
let context;

// Elements
let $canvasContainer;
let $canvas;

// Game's Local and Remote States
let state = {
    dragging: false,
    undoStack: [],
    
    color: 'black',
    setColor(c) {
        this.color = c
        this.refresh()
        console.log('setColor to', this.color)
    },

    thickness: 3,
    setThickness(r) {
        this.thickness = r
        this.refresh()
        console.log('setThickness to', this.thickness)
    },

    refresh() {
        context.fillStyle   = this.color
        context.strokeStyle = this.color
        context.lineWidth   = this.thickness * 2
        context.radius      = this.thickness
        console.log('refresh')
    }
}

window.addEventListener('load', onPageLoad)
window.addEventListener('resize', onResize)

function onResize() {
    const image = context.getImageData($canvas.clientLeft, $canvas.clientTop, $canvas.width, $canvas.height)
    const {width, height} = $canvasContainer.getBoundingClientRect()
    $canvas.width = width
    $canvas.height = height
    context.putImageData(image, $canvas.clientLeft, $canvas.clientTop)
    state.refresh()
}

function onPageLoad() {
    // Canvas
    initCanvas()
    state.refresh()
    
    // Undo button
    document.getElementById('undo').addEventListener('click', undoHandler)

    // Ctrl+Z Undo
    document.addEventListener('keydown', (evt) => {
        if (evt.ctrlKey && evt.keyCode === 90) {
            undoHandler()
        }
    })

    function undoHandler() {
        undo()
        Remote.send(Remote.e.undo)
    }
    
    // Clear button
    document.getElementById('clear').addEventListener('click', () => {
        clear()
        Remote.send(Remote.e.clear)
    })
    
    // Color Select Shortcuts (Numbers)
    const colors = [
        'black', // 1
        'blue',  // 2
        'red',   // 3
        'green', // 4
    ];
    document.addEventListener('keydown', (evt) => {        
        const num = evt.keyCode - 49;
        const color = colors[num];
        if (color) {
            state.setColor(color)
            Remote.send(Remote.e.setColor, color)
        }
    })
    // Color Buttons
    const $colors = document.getElementById('colors');
    for(const color of colors) {
        const btn = document.createElement('button')
        btn.style.backgroundColor = color;
        btn.addEventListener('click', () => {
            state.setColor(color)
            Remote.send(Remote.e.setColor, color)
        })
        $colors.appendChild(btn)
    }

    
    // Line Width Buttons
    for(const btn of document.getElementsByClassName('thickness')) {
        btn.addEventListener('click', () => {
            const thickness = btn.getAttribute('data-thickness');
            state.setThickness(thickness)
            Remote.send(Remote.e.setThickness, thickness)
        })
    }
}

function undo() {
    if (state.undoStack.length >= 1) {
        const image = state.undoStack.pop()
        context.putImageData(image, $canvas.clientLeft, $canvas.clientTop)
    } else {
        console.log('undo stack is empty')
    }
}

function clear() {
    $canvas.width = $canvas.width // this magically clears canvas
    state.undoStack = []
    state.refresh()
}

function initCanvas() {
    // Canvas
    $canvasContainer = document.getElementById('canvasContainer');
    $canvas = document.getElementById('canvas')
    // Initialization
    let {width, height} = $canvasContainer.getBoundingClientRect()
    $canvas.width = width
    $canvas.height = height
    context = $canvas.getContext('2d')

    // Canvas Events
    $canvas.addEventListener('mousedown', mouseDown)
    $canvas.addEventListener('mousemove', mouseMove)
    $canvas.addEventListener('mouseup', mouseUp)

    function mouseDown(e) {
        const [x, y] = getMousePos(e)
        Remote.send(Remote.e.mouseDown, foldScale(x, y))
        // Update undoStack
        const image = context.getImageData($canvas.clientLeft, $canvas.clientTop, $canvas.width, $canvas.height)
        state.undoStack.push(image)
        
        state.dragging = true
        mouseMove(e) // draw a point
    }

    function mouseMove(e) {
        const [x, y] = getMousePos(e)
        // may use e.clientX instead of e.offsetX
        if (state.dragging) {
            context.lineTo(x, y)
            context.stroke()
            context.beginPath()
            context.arc(x, y, state.thickness, 0, Math.PI*2)
            context.fill()
            context.beginPath()
            context.moveTo(x, y)
            Remote.send(Remote.e.mouseMove, foldScale(x, y))
        }
    }

    function mouseUp(e) {
        state.dragging = false
        context.beginPath() // clears the previous path
        Remote.send(Remote.e.mouseUp)
    }
}

function getMousePos(e) {
    const rect = $canvas.getBoundingClientRect()
    // console.log(canvas.width, rect.width)
    const scaleX = $canvas.width / rect.width
    const scaleY = $canvas.height / rect.height
    return [
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top)  * scaleY,
    ];
}

function foldScale(x, y) {
    return [
        x / $canvas.width,
        y / $canvas.height,
    ]
}

function unFoldScale(x, y) {
    return [
        x * $canvas.width,
        y * $canvas.height,
    ]
}

const Remote = {
    e: {
        mouseDown: 'mouseDown',
        mouseMove: 'mouseMove',
        mouseUp: 'mouseUp',
        
        setColor: 'setColor',
        setThickness: 'setThickness',
        
        clear: 'clear',
        undo: 'undo',
    },

    send(event, message) {
        if (!(event in this.e)) {
            throw new Error("Unknown event: " + event)
        }

        if (message) {
            socket.emit(event, message)
        } else {
            socket.emit(event)
        }
    },

    // init listens for remote events on the socket. It is the recieving code.
    init() {
        console.log('Remote init()')
        socket.on(this.e.mouseMove, ([x, y]) => {
            [x, y] = unFoldScale(x, y)
            context.lineTo(x, y)
            context.stroke()
            context.beginPath()
            context.arc(x, y, state.thickness, 0, Math.PI*2)
            context.fill()
            context.beginPath()
            context.moveTo(x, y)
        })
        
        socket.on(this.e.mouseDown, ([x, y]) => {
            let image = context.getImageData($canvas.clientLeft, $canvas.clientTop, $canvas.width, $canvas.height)
            state.undoStack.push(image)
        })
        
        socket.on(this.e.mouseUp, () => {
            context.beginPath() // clears the previous path
        })
        
        socket.on(this.e.clear, clear)
        socket.on(this.e.undo, undo)
        socket.on(this.e.setColor, (c) => state.setColor(c))
        socket.on(this.e.setThickness, (r) => state.setThickness(r))
    },
}
Remote.init();