import { Server } from 'ws';
import mongoose from 'mongoose';

const wss = new Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('Cliente conectado al WebSocket');

  // Aquí puedes realizar acciones cuando un cliente se conecta.

  ws.on('close', () => {
    console.log('Cliente desconectado del WebSocket');
    // Aquí puedes realizar acciones cuando un cliente se desconecta.
  });
});

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/ClusterNE', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Conexión a MongoDB establecida');

  // Iniciar el servidor HTTP de Next.js
  const httpServer = require('http').createServer();
  httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  const PORT = process.env.PORT || 3000;

  httpServer.listen(PORT, () => {
    console.log(`Servidor y WebSocket en ejecución en http://localhost:${PORT}`);
  });
});

mongoose.connection.on('error', (error) => {
  console.error('Error de conexión a MongoDB:', error.message);
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.log('Desconectado de MongoDB');
  process.exit(1);
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Conexión a MongoDB cerrada debido a la terminación del proceso');
    process.exit(0);
  });
});
