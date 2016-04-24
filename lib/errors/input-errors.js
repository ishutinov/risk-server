'use strict';

module.exports = {
    MissingDataError: {
        name: 'MissingDataError',
        message: data => `Event is missing data: ${data.properties}`,
        data: {
            properties: 'Names of the missing properties.'
        },
        required: ['properties']
    }
};
