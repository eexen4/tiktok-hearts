import { Server } from 'ws';

const wss = new Server({ noServer: true });

let tiktokConnection = null;

// Gdy ktoś się łączy przez WebSocket
wss.on('connection', function connection(ws) {
  console.log('WebSocket client connected');
  
  setInterval(() => {
    ws.send(JSON.stringify({
      type: 'like',
      user: { profilePictureUrl: '' },
      likeCount: 1
    }));
  }, 2000);
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  if (res.socket.server.wss) {
    console.log('WebSocket server already running');
  } else {
    console.log('Starting WebSocket server');
    res.socket.server.wss = wss;
    res.socket.server.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  }

  res.end();
}
