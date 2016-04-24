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
    }
};
