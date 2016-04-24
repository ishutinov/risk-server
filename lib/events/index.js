'use strict';

const INPUT_EVENTS = require('./input-events');
const OUTPUT_EVENTS = require('./output-events');

function missingEventProperties (event, data) {
    const missing = [];

    if (event.required) {
        for (const key of event.required) {
            if (!data.hasOwnProperty(key)) {
                missing.push(key);
            }
        }
    }

    return missing;
}

function createEvent (event, data) {
    const missing = missingEventProperties(event, data);

    if (missing.length > 0) {
        throw new Error(`Event "${event.name}" is missing required data properties: ${missing.join(', ')}.`);
    }

    let message = data.message || null;

    if (!message && event.message) {
        if (typeof event.message === 'function') {
            message = event.message(data);
        } else {
            message = event.message;
        }
    }

    return {
        name: event.name,
        data: Object.assign({}, data, { message })
    };
}

module.exports = { INPUT_EVENTS, OUTPUT_EVENTS, createEvent, missingEventProperties };
