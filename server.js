// UBR Voice Chat Server
// Simple Node.js server for voice chat relay
// Free hosting: Render.com, Railway.app, Fly.io

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Store connected players by server address
const players = new Map(); // serverAddress -> Set of player names
const voiceConnections = new Map(); // playerName -> socket

// HTTP endpoint to receive audio data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.post('/api/voice', (req, res) => {
  const { playerName, serverAddress, audioData, sampleRate, channels } = req.body;
  
  if(!playerName || !serverAddress) {
    return res.status(400).json({ error: 'Missing playerName or serverAddress' });
  }
  
  // Broadcast audio to all players on the same server
  const playersOnServer = players.get(serverAddress) || new Set();
  
  // Send audio to all connected players except sender
  for(const [name, socket] of voiceConnections.entries()) {
    if(name !== playerName && playersOnServer.has(name)) {
      socket.emit('voiceData', {
        from: playerName,
        audioData: audioData,
        sampleRate: sampleRate || 16000,
        channels: channels || 1
      });
    }
  }
  
  res.json({ success: true });
});

// WebSocket for real-time voice chat
io.on('connection', (socket) => {
  let playerName = null;
  let serverAddress = null;
  
  socket.on('register', (data) => {
    playerName = data.playerName;
    serverAddress = data.serverAddress;
    
    if(!playerName || !serverAddress) {
      socket.disconnect();
      return;
    }
    
    // Add player to server group
    if(!players.has(serverAddress)) {
      players.set(serverAddress, new Set());
    }
    players.get(serverAddress).add(playerName);
    voiceConnections.set(playerName, socket);
    
    console.log(`Player ${playerName} connected on server ${serverAddress}`);
    
    // Notify other players
    socket.broadcast.emit('playerJoined', {
      playerName: playerName,
      serverAddress: serverAddress
    });
  });
  
  socket.on('voiceData', (data) => {
    if(!playerName || !serverAddress) return;
    
    // Broadcast to all players on same server except sender
    const playersOnServer = players.get(serverAddress) || new Set();
    
    for(const [name, otherSocket] of voiceConnections.entries()) {
      if(name !== playerName && playersOnServer.has(name)) {
        otherSocket.emit('voiceData', {
          from: playerName,
          audioData: data.audioData,
          sampleRate: data.sampleRate || 16000,
          channels: data.channels || 1
        });
      }
    }
  });
  
  socket.on('disconnect', () => {
    if(playerName && serverAddress) {
      const playersOnServer = players.get(serverAddress);
      if(playersOnServer) {
        playersOnServer.delete(playerName);
        if(playersOnServer.size === 0) {
          players.delete(serverAddress);
        }
      }
      voiceConnections.delete(playerName);
      
      console.log(`Player ${playerName} disconnected from server ${serverAddress}`);
      
      // Notify other players
      socket.broadcast.emit('playerLeft', {
        playerName: playerName,
        serverAddress: serverAddress
      });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', players: voiceConnections.size });
});

http.listen(PORT, () => {
  console.log(`UBR Voice Chat Server running on port ${PORT}`);
});
