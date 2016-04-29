'use strict';

module.exports = {
    NameInUseError: {
        name: 'NameInUseError',
        message: data => `Name "${data.name}" is already used.`,
        data: {
            name: 'Name attempted to use.'
        },
        required: ['name']
    },
    MissingDataError: {
        name: 'MissingDataError',
        message: data => `Event ${data.name} is missing data: ${data.properties}`,
        data: {
            name: 'Event name',
            properties: 'Names of the missing properties.'
        },
        required: ['properties']
    },
    RoomNameExistsError: {
        name: 'RoomNameExistsError',
        message: data => `Room with name "${data.name}" already exists.`,
        data: {
            name: 'Name of the room'
        },
        required: ['name']
    },
    NoRoomFoundError: {
        name: 'NoRoomFoundError',
        message: data => `No room found with id "${data.id}"`,
        data: {
            id: 'The id of the room attempted to join.'
        },
        required: ['id']
    },
    AlreadyInRoomError: {
        name: 'AlreadyInRoomError',
        message: 'You are already in a room.'
    },
    NotInRoomError: {
        name: 'NotInRoomError',
        message: 'You are not in a room.'
    },
    RoomFullError: {
        name: 'RoomFullError',
        message: 'Room is full.',
        data: {
            id: 'The id of the room attempted to join.'
        },
        required: ['id']
    }
};
