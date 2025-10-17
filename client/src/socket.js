import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Log when socket connects
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});

export default socket;