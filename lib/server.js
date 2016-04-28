'use strict';

const debug = require('debug')('risk-server:server');
const argv = require('minimist')(process.argv.slice(2));
const SocketServer = require('socket.io');
const PORT = argv.port || 8080;
const events = require('./events');
const Socket = require('./Socket');
const Room = require('./Room');
const Client = require('./Client');
const InputEvent = events.INPUT_EVENTS;
const OutputEvent = events.OUTPUT_EVENTS;

const errors = require('./errors');
const createError = errors.createError;
const ERRORS = errors.ERRORS;

function listen (io) {
    const clients = new Map();
    const rooms = new Map();

    function emitToClients (event, data) {
        for (const client of clients.values()) {
            client.emit(event, data);
        }
    }

    function generateId (str) {
        return str.replace(/[^A-Z0-9]+/ig, '_');
    }

    function clientListener (client) {
        client.on(InputEvent.CREATE_ROOM, data => {
            const id = generateId(data.name);

            if (rooms.has(id)) {
                client.error(createError(ERRORS.RoomNameExistsError));
            } else {
                const room = new Room(id, data.name, data.maxClients, client);

                rooms.set(room.id, room);

                client.emit(OutputEvent.ROOM_CREATED, room.toJSON());
                emitToClients(OutputEvent.ROOMS_UPDATE, {
                    rooms: Array.from(rooms.values()).map(room => room.toJSON())
                });
            }
        });

        client.on(InputEvent.JOIN_ROOM, data => {
            if (client.currentRoom) {
                client.error(createError(ERRORS.AlreadyInRoomError));
            } else {
                const room = rooms.get(data.id);

                if (room) {
                    room.join(client);
                    client.emit(OutputEvent.JOINED_ROOM, room.toJSON());
                    emitToClients(OutputEvent.ROOMS_UPDATE, {
                        rooms: Array.from(rooms.values()).map(room => room.toJSON())
                    });
                } else {
                    client.error(createError(ERRORS.NoRoomFoundError));
                }
            }
        });

        client.on(InputEvent.LEAVE_ROOM, () => {
            if (client.inRoom) {
                const room = client.currentRoom;

                room.leave(client);

                if (room.isEmpty()) {
                    rooms.delete(room.id);
                }

                client.emit(OutputEvent.LEFT_ROOM);
                emitToClients(OutputEvent.ROOMS_UPDATE, {
                    rooms: Array.from(rooms.values()).map(room => room.toJSON())
                });
            } else {
                client.error(createError(ERRORS.NotInRoomError));
            }
        });

        client.on('disconnect', () => {
            clients.delete(client.id);
            debug('client disconnected', client.id);
        });

        client.on('error', (err) => {
            debug('client error', err);
        });
    }

    io.on('connection', rawSocket => {
        const socket = new Socket(rawSocket);

        debug('socket connected', { socketId: rawSocket.id });

        socket.on(InputEvent.REGISTER, data => {
            const id = generateId(data.name);

            if (clients.has(id)) {
                socket.error(createError(ERRORS.NameInUseError, { name: id }));
            } else {
                const client = new Client(socket, id, data.name);

                socket.emit(OutputEvent.READY, {
                    client: client.toJSON(),
                    rooms: Array.from(rooms.values()).map(room => room.toJSON())
                });

                clients.set(client.id, client);

                clientListener(client);
            }
        });
    });
}

function start (port) {
    const io = new SocketServer();

    io.listen(port || PORT);

    debug('server started', port || PORT);

    listen(io);

    return io;
}

module.exports = { start };
