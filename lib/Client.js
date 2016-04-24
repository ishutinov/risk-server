'use strict';

const Socket = require('./Socket');

function camelCase (str) {
    return str.replace(/(\-[a-z])/g, str.toUpperCase().replace('-', ''));
}

class Client extends Socket {
    constructor (socket, name) {
        super(socket);

        this.name = name;
        this.id = camelCase(name);
    }

    join (room) {
        this.socket.join(room);
    }

    leave (room) {
        this.socket.leave(room);
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name
        }
    }
}

module.exports = Client;
