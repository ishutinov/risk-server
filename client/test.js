'use strict';

const socket = require('socket.io-client')('http://localhost:8080');
const debug = require('debug')('risk-client');

socket.on('connect', () => {
    debug('connected to server.');
});

socket.on('ready', (data) => {
    debug('server is ready', data);
});

socket.on('disconnect', () => {
    debug('server disconnected');
});

socket.on('serverError', (err) => {
    console.log('sssssssssssssssss')
    debug('server returned error', err);
});

socket.on('roomCreated', data => {
    console.log('room created', data);
})

socket.emit('register', {
    name: 'yo'
});

socket.emit('createRoom', {
    name: 'testroom',
    maxClients: 20
});

