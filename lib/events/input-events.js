'use strict';

module.exports = {
    REGISTER: {
        name: 'register',
        message: data => `Client on socket "${data.socketId}" registered with name "${data.name}".`,
        data: {
            socketId: 'The id of the registered socket',
            name: 'Name of the client'
        },
        required: ['socketId', 'name']
    },
    GET_ROOMS: {
        name: 'getRooms',
        message: data => `Rooms: ${data.roomIds.map(id => `"${id}"`).join(', ')}`,
        data: {
            roomIds: 'List of room ids'
        }
    },
    JOIN_ROOM: {
        name: 'joinRoom',
        message: 'Join a room.',
        data: {
            id: 'The id of the room.'
        }
    },
    LEAVE_ROOM: {
        name: 'leaveRoom',
        message: 'Leave a room.',
        data: {
            id: 'The id of the room'
        }
    },
    CREATE_ROOM: {
        name: 'createRoom',
        message: 'Create a room.',
        data: {
            name: 'Name of the room.',
            maxClients: 'Maximum number of clients.'
        },
        required: ['name', 'maxClients']
    }
};
