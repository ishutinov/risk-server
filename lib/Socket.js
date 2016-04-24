'use strict';

const events = require('./events');
const errors = require('./errors');
const debug = require('debug')('risk-server:Socket');
const ERRORS = errors.ERRORS;
const createError = errors.createError;
const createEvent = events.createEvent;
const missingEventProperties = events.missingEventProperties;

class Socket {
    constructor (io) {
        this.io = io;
    }

    emit (event, data) {
        const eventData = createEvent(event, data);

        debug('emitting event', eventData);

        this.io.emit(eventData.name, data);
    }

    error (error) {
        debug('emitting error', error);

        this.io.emit('serverError', {
            name: error.name,
            data: error.data
        });
    }

    on (event, done) {
        if (typeof event === 'string') {
            this.io.on(event, done);
        } else {
            this.io.on(event.name, data => {
                data.socketId = this.io.id;

                const missingProperties = missingEventProperties(event, data);

                if (missingProperties.length > 0) {
                    this.error(createError(ERRORS.MissingDataError, {
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
