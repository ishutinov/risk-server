'use strict';

const debug = require('debug')('risk-server:index');
const argv = require('minimist')(process.argv.slice(2));
const SocketServer = require('socket.io');
const PORT = argv.port || 8080;
const io = new SocketServer();
const uuid = require('node-uuid');
const events = require('./events');
const Socket = require('./Socket');
const Room = require('./Room');
const Client = require('./Client');
const createEvent = events.createEvent;
const InputEvent = events.INPUT_EVENTS;
const OutputEvent = events.OUTPUT_EVENTS;

const clients = new Map();
const rooms = new Map();

function clientListener (client) {
    client.on();
}

io.on('connection', rawSocket => {
    const socket = new Socket(rawSocket);

    debug('socket connected', { socketId: rawSocket.id });

    socket.on(InputEvent.REGISTER, data => {
        const client = new Client(socket, data.name);

        socket.emit(OutputEvent.READY, {
            client: client.toJSON()
        });

        clientListener(client);
    });
    //
    // socket.on('create_room', data => {
    //     try {
    //         let room = new Room(data.name, data.maxPlayers, client, io);
    //
    //         rooms.set(room.name, room);
    //
    //         client.inRoom = room;
    //
    //         debug('room created', client.id, room.toJSON());
    //
    //         socket.emit('created_room', {
    //             room: room.toJSON()
    //         });
    //
    //     } catch (err) {
    //         error(socket, {
    //             error: 'error creating room'
    //         });
    //
    //         debug('error creating room', err.stack);
    //     }
    // });
    //
    // socket.on('room_info', data => {
    //     let room = rooms.get(data.name);
    //
    //     if (room) {
    //         socket.emit('info', room.toJSON());
    //     }
    // });
    //
    // socket.on('join_room', data => {
    //     try {
    //         let room = rooms.get(data.name);
    //
    //         room.join(client);
    //
    //         debug('client joined room', room.name, client.id);
    //
    //         io.sockets.emit('joined_room', {
    //             room: room.toJSON(),
    //             client: {
    //                 id: client.id,
    //                 name: client.name
    //             }
    //         })
    //     } catch (err) {
    //         error(socket, { error: 'error joining room' });
    //
    //         debug('error joining room', err.stack);
    //     }
    // });
    //
    // socket.on('leave_room', data => {
    //     if (client.inRoom) {
    //         debug('client leaving room', client.id);
    //
    //         // If owner, remove the room
    //         if (client.inRoom.owner === client) {
    //             rooms.delete(client.inRoom.name);
    //         }
    //
    //         client.inRoom.leave(client.id);
    //
    //         io.sockets.emit('left_room', {
    //             room: client.inRoom.toJSON(),
    //             client: {
    //                 id: client.id,
    //                 name: client.name
    //             }
    //         });
    //
    //         client.inRoom = null;
    //     } else {
    //         error(socket, {
    //             error: 'not in room'
    //         });
    //     }
    // });
    //
    // socket.on('start', data => {
    //     try {
    //         if (client.inRoom) {
    //             client.inRoom.start(client);
    //         } else {
    //             throw Error('Not in a room');
    //         }
    //     } catch (err) {
    //         error(socket, {
    //             error: 'error starting game'
    //         });
    //
    //         debug('error starting game', err.stack);
    //     }
    // });

    socket.on('disconnect', () => {
        debug('socket disconnected', { sockedId: socket.id });
    });

    socket.on('error', err => {
        console.log('global error', err);
    });
});


io.listen(PORT);
debug('server started', PORT);
