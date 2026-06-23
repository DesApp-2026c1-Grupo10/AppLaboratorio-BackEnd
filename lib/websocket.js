import { WebSocketServer } from 'ws';

let wss;

export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');

    ws.on('close', () => {
      console.log('Cliente WebSocket desconectado');
    });
  });

  console.log('WebSocket server iniciado en /ws');
}

export function broadcast(event, data) {
  if (!wss) return;
  const message = JSON.stringify({
    event,
    data,
    timestamp: new Date().toISOString(),
  });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}
