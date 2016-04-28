'use strict';

const chai = require('chai');
const expect = chai.expect;
const SocketClient = require('socket.io-client');
const co = require('co');
const async = co.wrap;
const Server = require('../lib/server');
const os = require('os');
const PORT = 8888;
const URL = `http://${os.hostname()}:${PORT}`;

function registerClients (clientA, clientB) {
    const eventData = {
        clientA: {},
        clientB: {}
    };

    return Promise.all([
        new Promise(resolve => {
            clientA.on('ready', data => {
                eventData.clientA.READY = data;
                resolve();
            });

            clientA.emit('register', {
                name: 'TestUser'
            });
        }),
        new Promise(resolve => {
            clientB.on('ready', data => {
                eventData.clientB.READY = data;
                resolve();
            });

            clientB.emit('register', {
                name: 'User 2'
            });
        }),
    ]).then(() => eventData);
}

describe('rooms', function () {
    context('clientA creates a room', function () {
        let server = null;
        let clientA = null;
        let clientB = null;
        let eventData = null;

        before(async(function *() {
            server = Server.start(PORT);

            clientA = SocketClient(URL);
            clientB = SocketClient(URL);

            eventData = yield registerClients(clientA, clientB);
        }));

        it('clients joined server', function () {
            expect(eventData.clientA.READY).to.deep.equal({
                client: { id: 'TestUser', name: 'TestUser', inRoom: false },
                rooms: []
            });

            expect(eventData.clientB.READY).to.deep.equal({
                client: { id: 'User_2', name: 'User 2', inRoom: false },
                rooms: []
            });
        });

        it('clientA created a room', function (done) {
            let count = 0;
            const tryDone = () => {
                count += 1;

                if (count === 3) {
                    done();
                }
            };

            clientA.on('roomCreated', data => {
                expect(data).to.deep.equal({
                    id: 'hello',
                    name: 'hello',
                    maxClients: 6,
                    clients: [{ id: 'TestUser', name: 'TestUser', inRoom: true }]
                });

                tryDone();
            });

            clientA.on('roomsUpdate', data => {
                expect(data.rooms).to.be.an('array');
                expect(data.rooms).to.have.length(1);
                expect(data.rooms[0].clients).to.be.an('array');
                expect(data.rooms[0].clients).to.have.length(1);
                expect(data.rooms[0].clients[0].name).to.equal('TestUser');

                tryDone();
            });

            clientB.on('roomsUpdate', data => {
                expect(data.rooms).to.be.an('array');
                expect(data.rooms).to.have.length(1);
                expect(data.rooms[0].clients).to.have.length(1);
                expect(data.rooms[0].clients[0].name).to.equal('TestUser');

                tryDone();
            });

            clientA.emit('createRoom', { name: 'hello', maxClients: 6 });
        });

        after(function () {
            return server.close();
        });
    });

    context('clientA creates a room, clientB joins', function () {
        let server = null;
        let clientA = null;
        let clientB = null;

        before(async(function *() {
            server = Server.start(PORT);

            clientA = SocketClient(URL);
            clientB = SocketClient(URL);

            yield registerClients(clientA, clientB);
        }));

        it('clientB joins the room', function (done) {
            const eventsA = {
                roomsUpdate: []
            };

            const eventsB = {
                roomsUpdate: []
            };

            let count = 0;
            const tryDone = () => {
                count += 1;

                if (count === 4) {
                    expect(eventsA.roomsUpdate).to.have.length(2);
                    expect(eventsA.roomsUpdate[0].rooms).to.be.an('array');
                    expect(eventsA.roomsUpdate[0].rooms).to.have.length(1);
                    expect(eventsA.roomsUpdate[0].rooms[0].clients).to.have.length(1);
                    expect(eventsA.roomsUpdate[0].rooms[0].clients[0].name).to.equal('TestUser');

                    expect(eventsA.roomsUpdate[1].rooms).to.be.an('array');
                    expect(eventsA.roomsUpdate[1].rooms).to.have.length(1);
                    expect(eventsA.roomsUpdate[1].rooms[0].clients).to.have.length(2);
                    expect(eventsA.roomsUpdate[1].rooms[0].clients[0].name).to.equal('TestUser');
                    expect(eventsA.roomsUpdate[1].rooms[0].clients[1].name).to.equal('User 2');

                    expect(eventsB.roomsUpdate).to.have.length(2);
                    expect(eventsB.roomsUpdate[0].rooms).to.be.an('array');
                    expect(eventsB.roomsUpdate[0].rooms).to.have.length(1);
                    expect(eventsB.roomsUpdate[0].rooms[0].clients).to.have.length(1);
                    expect(eventsB.roomsUpdate[0].rooms[0].clients[0].name).to.equal('TestUser');

                    expect(eventsB.roomsUpdate[1].rooms).to.be.an('array');
                    expect(eventsB.roomsUpdate[1].rooms).to.have.length(1);
                    expect(eventsB.roomsUpdate[1].rooms[0].clients).to.have.length(2);
                    expect(eventsB.roomsUpdate[1].rooms[0].clients[0].name).to.equal('TestUser');
                    expect(eventsB.roomsUpdate[1].rooms[0].clients[1].name).to.equal('User 2');

                    done();
                }
            };

            clientA.on('roomsUpdate', data => {
                eventsA.roomsUpdate.push(data);

                tryDone();
            });

            clientB.on('roomsUpdate', data => {
                eventsB.roomsUpdate.push(data);

                tryDone();
            });

            clientA.emit('createRoom', { name: 'hello', maxClients: 6 });
            clientB.emit('joinRoom', { id: 'hello' });
        });

        after(function () {
            return server.close();
        });
    });

    context('clientB creates a room that already exists', function () {
        let server = null;
        let clientA = null;
        let clientB = null;

        before(async(function *() {
            server = Server.start(PORT);

            clientA = SocketClient(URL);
            clientB = SocketClient(URL);

            yield registerClients(clientA, clientB);
        }));

        it('error on room join attempt', function (done) {
            let count = 0;
            const tryDone = () => {
                count += 1;

                if (count === 1) {
                    done();
                }
            };

            clientB.on('serverError', err => {
                expect(err.name).to.equal('RoomNameExistsError');

                tryDone();
            });

            clientA.emit('createRoom', { name: 'room1', maxClients: 6 });
            clientB.emit('createRoom', { name: 'room1', maxClients: 3 });
        });

        after(function () {
            return server.close();
        });
    });


    context('clientA tries to join room while in one', function () {
        let server = null;
        let clientA = null;
        let clientB = null;

        before(async(function *() {
            server = Server.start(PORT);

            clientA = SocketClient(URL);
            clientB = SocketClient(URL);

            yield registerClients(clientA, clientB);
        }));

        it('error on room join attempt', function (done) {
            let count = 0;
            const tryDone = () => {
                count += 1;

                if (count === 1) {
                    done();
                }
            };

            clientA.on('serverError', err => {
                expect(err.name).to.equal('AlreadyInRoomError');

                tryDone();
            });

            clientA.emit('createRoom', { name: 'room1', maxClients: 6 });
            clientB.emit('createRoom', { name: 'room2', maxClients: 3 });

            clientA.emit('joinRoom', { id: 'room2' });
            clientA.emit('joinRoom', { id: 'room2' });
        });

        after(function () {
            return server.close();
        });
    });

    context('clientA tries to join a non existing room', function () {
        let server = null;
        let clientA = null;
        let clientB = null;

        before(async(function *() {
            server = Server.start(PORT);

            clientA = SocketClient(URL);
            clientB = SocketClient(URL);

            yield registerClients(clientA, clientB);
        }));

        it('error on room join attempt', function (done) {
            let count = 0;
            const tryDone = () => {
                count += 1;

                if (count === 1) {
                    done();
                }
            };

            clientA.on('serverError', err => {
                expect(err.name).to.equal('NoRoomFoundError');

                tryDone();
            });

            clientA.emit('joinRoom', { id: 'doesnotexist' });
        });

        after(function () {
            return server.close();
        });
    });

    context('clientA tries to leave a room while not in one', function () {
        let server = null;
        let clientA = null;
        let clientB = null;

        before(async(function *() {
            server = Server.start(PORT);

            clientA = SocketClient(URL);
            clientB = SocketClient(URL);

            yield registerClients(clientA, clientB);
        }));

        it('error on room join attempt', function (done) {
            let count = 0;
            const tryDone = () => {
                count += 1;

                if (count === 1) {
                    done();
                }
            };

            clientA.on('serverError', err => {
                expect(err.name).to.equal('NotInRoomError');

                tryDone();
            });

            clientA.emit('leaveRoom', { id: 'doesnotexist' });
        });

        after(function () {
            return server.close();
        });
    });

    context('clients join a room and leaves', function () {
        let server = null;
        let clientA = null;
        let clientB = null;

        before(async(function *() {
            server = Server.start(PORT);

            clientA = SocketClient(URL);
            clientB = SocketClient(URL);

            yield registerClients(clientA, clientB);
        }));

        it('room is deleted after leaving', function (done) {
            const roomUpdates = [];
            let count = 0;
            const tryDone = () => {
                count += 1;

                if (count === 3) {
                    expect(roomUpdates).to.have.length(2);
                    expect(roomUpdates[0].rooms).to.have.length(1);
                    expect(roomUpdates[1].rooms).to.have.length(0);

                    done();
                }
            };

            clientA.on('leftRoom', data => {
                expect(data).to.equal(null);

                tryDone();
            });

            clientA.on('roomsUpdate', data => {
                roomUpdates.push(data);

                tryDone();
            });

            clientA.on('roomCreated', () => {
                clientA.emit('leaveRoom', { id: 'room1' });
            });

            clientA.emit('createRoom', { name: 'room1', maxClients: 3 });
        });

        after(function () {
            return server.close();
        });
    });
});
