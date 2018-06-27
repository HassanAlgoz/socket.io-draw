import socket from './net.js'

// username is used to be compared with 'from' in 'msg' events
let username;

window.addEventListener('load', () => {

    const $loginForm = document.getElementById('loginForm')
    const $nameInput = document.getElementById('nameInput')
    const $messageInput = document.getElementById('messageInput');
    const $messageForm = document.getElementById('messageForm')
    const $messagesContainer = document.getElementById('messagesContainer')
    const $canvas = document.getElementById('canvas')
    const $canvasButtonsRow = document.getElementById('canvasButtonsRow')
    
    // Login
    $loginForm.addEventListener('submit', function(event) {
        event.preventDefault()
        // Login with `name`
        let name = $nameInput.value;
        login(name)

        // Remove the login form and show other UI components
        $loginForm.remove()
        $messageForm.classList.remove('hidden')
        $canvas.classList.remove('hidden')
        $canvasButtonsRow.classList.remove('hidden')
    })

    // Send Message
    $messageForm.addEventListener('submit', function(event) {
        event.preventDefault()
        const message = $messageInput.value;
        $messageInput.value = "";
        // Send
        socket.emit('msg', message)
    })


    function login(name) {
        username = name;
        socket.emit('login', username)
        
        // Recieve Messages
        socket.on('msg', (data) => {
            if (data.from != username) {
                say(data.from, data.message)
            } else {
                say('me', data.message)
            }
        })
    }
    
    function say(name, message) {
        $messagesContainer.innerHTML +=
        `<div class="chat-message">
            <span style="color: red; font-weight: bold;">${name}:</span> <span class="msg">${message}</span>
        </div>`
        // Scroll down to last message
        $messagesContainer.scrollTop = $messagesContainer.scrollHeight
    }
})

