'use strict';

const debug = require('debug')('risk-server:Room');

const Socket = require('./Socket');

function camelCase (str) {
    return str.replace(/(\-[a-z])/g, str.toUpperCase().replace('-', ''));
}

class Room extends Socket {
    constructor (name, maxClients, client, io) {
        super(io);

        this.id = camelCase(name);
        this.name = name;
        this.owner = client;

        this.socket = new Socket(io.to(this.id));

        this.clients = new Map();
        this.maxClients = maxClients;
        this.clients.set(client.id, client);
        this.io = io;
        this.started = false;
        this.game = null;
    }

    join (client) {
        this.clients.set(client.id, client);

        client.join(this.id);
    }

    leave (client) {
        this.clients.delete(client.id);

        client.leave(this.id);
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name,
            maxClients: this.maxClients,
            clients: Array.from(this.clients.values()).map(client => {
                return client.name;
            })
        };
    }
}

module.exports = Room;
