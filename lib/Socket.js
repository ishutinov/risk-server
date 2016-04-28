'use strict';

const events = require('./events');
const errors = require('./errors');
const debug = require('debug')('risk-server:Socket');
const ERRORS = errors.ERRORS;
const createError = errors.createError;
const createEvent = events.createEvent;
const missingEventProperties = events.missingEventProperties;

class Socket {
    constructor (socket) {
        this._socket = socket;
    }

    emit (event, data) {
        const eventData = createEvent(event, data);

        debug('emitting event', eventData);

        this._socket.emit(eventData.name, data);
    }

    error (error) {
        debug('emitting error', error);

        this._socket.emit('serverError', {
            name: error.name,
            data: error.data
        });
    }

    on (event, done) {
        if (typeof event === 'string') {
            this._socket.on(event, done);
        } else {
            this._socket.on(event.name, data => {
                data.socketId = this._socket.id;

                const missingProperties = missingEventProperties(event, data);

                if (missingProperties.length > 0) {
                    this.error(createError(ERRORS.MissingDataError, {
                        name: event.name,
                        properties: missingProperties
                    }));
                } else {
                    done(data);
                }
            });
        }
    }
}

module.exports = Socket;
