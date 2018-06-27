import socket from './net.js'

// Broadcast a message to connected users when someone connects or disconnects
// Add “{user} is typing” functionality
// Show who’s online
// Add private messaging
// Share your improvements!

window.addEventListener('load', () => {

    const $loginForm = document.getElementById('loginForm')
    const $nameInput = document.getElementById('nameInput')
    const $messageInput = document.getElementById('messageInput');
    const $messageForm = document.getElementById('messageForm')
    const $messagesContainer = document.getElementById('messagesContainer')
    
    // username is used to be compared with 'from' in 'msg' events
    let username;
    function login(name) {
        // Create a socket connection
        username = name;
        socket.emit('login', name)
        // Recieve Message
        socket.on('msg', (data) => {
            if (data.from != username) {
                say(data.from, data.message)
            } else {
                say('me', data.message)
            }
        })
    }

    // Login
    $loginForm.addEventListener('submit', function(event) {
        event.preventDefault()
        // Login with `name`
        let name = $nameInput.value;
        login(name)
        // Remove the login form and
        // show the chat message form
        $loginForm.remove()
        $messageForm.classList.remove('hidden')
    })

    // Send Message
    $messageForm.addEventListener('submit', function(event) {
        event.preventDefault()
        let message = $messageInput.value;
        $messageInput.value = "";
        // Send
        socket.emit('msg', message)
    })

    function say(name, message) {
        $messagesContainer.innerHTML +=
        `<div class="chat-message">
            <span style="color: red; font-weight: bold;">${name}:</span> ${message}
        </div>`
        // Scroll down to last message
        $messagesContainer.scrollTop = $messagesContainer.scrollHeight
    }
})

