'use strict';

const GameFactory = require('./game-factory');
const Risk = require('../lib/risk/index');
const debug = require('debug')('risk/server:Room');

const Socket = require('./Socket');

function camelCase (str) {
    return str.replace(/(\-[a-z])/g, str.toUpperCase().replace('-', ''));
}

class Room {
    constructor (name, maxPlayers, client, io) {
        this.id = camelCase(name);
        this.name = name;
        this.owner = client;

        this.socket = new Socket(io.to(this.id));

        this.clients = new Map();
        this.maxPlayers = maxPlayers;
        this.clients.set(client.id, client);
        this.io = io;
        this.started = false;
        this.game = null;
    }

    join (client) {
        this.clients.set(client.id, client);

        client.socket.join(this.id);
    }

    leave (client) {
        this.clients.delete(client.id);

        client.socket.leave(this.id);
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name,
            maxPlayers: this.maxPlayers,
            clients: Array.from(this.clients.values()).map(client => {
                return client.name;
            })
        };
    }
}

module.exports = Room;
