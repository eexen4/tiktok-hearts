const express = require('express');
const { Server } = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');
const http = require('http');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('HTTP server is running!');
});

// WebSocket serwer
const wss = new Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', function connection(ws) {
  console.log('WebSocket client connected');
});

// Połączenie do TikTok Live
const tiktokUsername = 'ixen_lol'; // <--- TUTAJ WPISZ SWÓJ LOGIN TikToka (bez @)

const tiktokConnection = new WebcastPushConnection(tiktokUsername);

tiktokConnection.connect().then(state => {
  console.log(`Connected to roomId: ${state.roomId}`);
}).catch(err => {
  console.error('Failed to connect', err);
});

// Gdy ktoś da lajka
tiktokConnection.on('like', (data) => {
  console.log(`${data.uniqueId} tapped the screen ${data.likeCount} times!`);

  wss.clients.forEach(function each(client) {
    if (client.readyState === 1) { // Open WebSocket
      client.send(JSON.stringify({
        type: 'like',
        user: { profilePictureUrl: data.profilePictureUrl },
        likeCount: data.likeCount
      }));
    }
  });
});