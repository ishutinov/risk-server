'use strict';

const inputErrors = require('./input-errors');

const ERRORS = Object.assign({}, inputErrors);

function createError (errorDefinition, data) {
    data = data || {};
    let message = null;

    if (typeof errorDefinition.message === 'function') {
        message = errorDefinition.message(data);
    } else {
        message = errorDefinition.message;
    }

    const err = new Error(message);

    err.name = errorDefinition.name;
    err.data = data;

    return err;
}

module.exports = {
    createError,
    ERRORS
};
