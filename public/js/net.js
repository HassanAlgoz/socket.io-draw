// Socket Connect

// Get namespace from the url
let url = location.pathname.split('/');
let namespace = url[url.length - 1];
// socket is the global object used to listen on incoming messages and send (emit) ones to the server.
const socket = io(`/${namespace}`)

window.addEventListener('load', () => {
    document.getElementById('title').innerText = `Namespace: ${namespace}`
    document.title = namespace
})


window.onunload = () => {
    socket.close()
}

export default socket;