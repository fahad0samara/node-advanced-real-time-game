## 🎮 Game Frontend Integration Guide

This guide explains how to integrate your frontend application with the game backend API.

### 🔗 Connection Setup

```typescript
// Initialize Socket.IO connection
const socket = io('your-backend-url', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Handle connection events
socket.on('connect', () => {
  console.log('Connected to game server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from game server');
});
```

### 🎯 Game Events

```typescript
// Join matchmaking queue
socket.emit('findMatch', {
  skill: playerSkillRating,
  region: 'eu-west'
});

// Handle match found
socket.on('matchFound', ({ roomId }) => {
  console.log(`Joined game room: ${roomId}`);
});

// Send game actions
socket.emit('gameAction', {
  roomId: 'current-room-id',
  action: {
    type: 'movement',
    data: {
      position: { x: 100, y: 200 },
      timestamp: Date.now()
    }
  }
});

// Receive game state updates
socket.on('gameStateUpdate', (gameState) => {
  updateGameUI(gameState);
});
```

### 💰 Economy Integration

```typescript
// Purchase item
async function purchaseItem(itemId: string, quantity: number) {
  const response = await fetch('/api/economy/purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ itemId, quantity })
  });
  return response.json();
}

// Get wallet balance
async function getWallet() {
  const response = await fetch('/api/economy/wallet', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}
```

### 🎙️ Voice/Video Chat

```typescript
// Initialize WebRTC connection
const peerConnection = new RTCPeerConnection(configuration);

// Handle media streams
async function startVoiceChat() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });
}

// Connect to other players
peerConnection.ontrack = (event) => {
  const remoteStream = event.streams[0];
  remoteAudio.srcObject = remoteStream;
};
```

### 🎨 AR/VR Integration

```typescript
// Initialize AR session
const arSession = await navigator.xr.requestSession('immersive-ar');

// Handle AR/VR updates
function onXRFrame(timestamp, frame) {
  // Update AR/VR view
  const pose = frame.getViewerPose(referenceSpace);
  
  // Send pose to game server
  socket.emit('gameAction', {
    type: 'arUpdate',
    data: {
      position: pose.transform.position,
      orientation: pose.transform.orientation
    }
  });
}
```

### 📊 Analytics Integration

```typescript
// Track player events
function trackEvent(eventName: string, data: any) {
  socket.emit('analytics', {
    event: eventName,
    data,
    timestamp: Date.now()
  });
}

// Example usage
trackEvent('itemPurchase', {
  itemId: 'sword123',
  price: 100,
  currency: 'gold'
});
```