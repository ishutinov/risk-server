'use strict';

module.exports = {
    ROOMS_UPDATE: {
        name: 'roomsUpdate',
        message: 'Room state has updated'
    },
    CLIENT_CONNECTED: {
        name: 'clientConnected',
        message: 'New client connected'
    },

    // Private events
    JOINED_ROOM: {
        name: 'joinedRoom',
        message: 'You joined a room.'
    },
    LEFT_ROOM: {
        name: 'leftRoom',
        message: 'You left the room.'
    },
    ROOM_CREATED: {
        name: 'roomCreated',
        message: 'New room is created'
    },
    READY: {
        name: 'ready',
        message: 'You have successfully registered on the server.'
    }
};
