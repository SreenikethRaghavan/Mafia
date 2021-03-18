const config = require('../../config.json');

const loadLobbyEvents = require('../../Events/LobbyEvents');
const loadVoteEvents = require('../../Events/VoteEvents');
const loadGameStartEvents = require('../../Events/GameStartEvents');
const { loadNightTimeEvents } = require('../../Events/NightTimeVoteEvents');
const loadStateChangeEvents = require('../../Events/GameStateEvents/StateChangeEvents');

const MafiaGame = require('../../domain/MafiaGame');
const Room = require('../../domain/Room');
const Player = require('../../domain/Player');

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: config.cors_origin,
    },
});

let mafiaGame = null;

module.exports.createMafiaGameWithOnePlayerMock = function (port) {
    mafiaGame = new MafiaGame();
    const roomID = mafiaGame.newGame();
    mafiaGame.gameRoomsDict[roomID] = new Room();

    io.on('connection', (socket) => {
        loadLobbyEvents(io, socket, mafiaGame);
        loadVoteEvents(io, socket, mafiaGame);
        loadGameStartEvents(io, socket, mafiaGame);
        loadNightTimeEvents(io, socket, mafiaGame);
        loadStateChangeEvents(io, socket, mafiaGame);
        socket.player = new Player(socket.id, roomID, '', '');
        socket.join(roomID);
    });

    beforeAll((done) => {
        server.listen(port, () => {
            done();
        });
    });

    return { io: io, mafiaGame: mafiaGame, socketIOServer: server, roomID: roomID };
};

module.exports.addMafiaVote = function (voter, votedFor, roomID) {
    const room = mafiaGame.gameRoomsDict[roomID];
    const { mafiaVoteMap } = room.voteHandler;

    mafiaVoteMap[voter] = votedFor;
};
