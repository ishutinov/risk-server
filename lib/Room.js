'use strict';

const debug = require('debug')('risk-server:Room');
const errors = require('./errors');
const ERRORS = errors.ERRORS;
const createError = errors.createError;

class Room {
    constructor (id, name, maxClients, client) {
        this.id = id;
        this.name = name;
        this.owner = client;

        this.clients = new Map();
        this.maxClients = maxClients;
        this.join(client);
    }

    isEmpty () {
        return this.clients.size === 0;
    }

    join (client) {
        if (this.clients.size === this.maxClients) {
            client.error(createError(ERRORS.RoomFullError, {
                id: this.id
            }));
        } else {
            client.currentRoom = this;
            this.clients.set(client.id, client);

            debug('Client joined room', client.toJSON());
        }
    }

    leave (client) {
        client.currentRoom = null;

        this.clients.delete(client.id);

        debug('Client left room', client.toJSON());
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name,
            maxClients: this.maxClients,
            clients: Array.from(this.clients.values()).map(client => {
                return client.toJSON();
            })
        };
    }
}

module.exports = Room;
