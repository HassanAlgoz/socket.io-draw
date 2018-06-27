# Shared Boards
An online website of rooms/namespaces which users can join in to draw on shared boards while chatting.

## Client-Server
The "app" uses [SOCKET.IO 2.x](https://socket.io/) library (which has a very good API and documentation) to allow users to communicate via a server which only broadcasts their messages to each other. Both the server (Node.js) and the client (Browser JS) are setup in this project. Just run `npm install && npm start` and you are good to go on [localhost:3000/lobby](localhost:3000/lobby).

## Play
Open two browser tabs on [localhost:3000/lobby](localhost:3000/lobby) and join the same room. Now you have two connected clients.

## Drawing Canvas
The drawing is done on an HTML5 canvas. Mouse events for drawing, and other events such as color change, and thickness change are communicated to other users connected to the same namespace (room) on that same server.

## Chat
A chat functionality is also implemented so that users can chat and draw at the same time.

## Experimental
This is meant as an example and by no means is it production-ready. Feel free to experiment with it to learn the concepts and the API of the library used. I have written some comments here and there. But, I might have left few things out.

If you find this helpful please let me know that I made something useful. Thanks.