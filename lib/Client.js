'use strict';

class Client {
    constructor (socket, id, name) {
        this.socket = socket;
        this.id = id;
        this.name = name;
        this.currentRoom = null;
    }

    emit (...args) {
        this.socket.emit(...args);
    }

    on (...args) {
        this.socket.on(...args);
    }

    error (...args) {
        this.socket.error(...args);
    }

    get inRoom () {
        return this.currentRoom !== null;
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name,
            inRoom: this.inRoom
        };
    }
}

module.exports = Client;
