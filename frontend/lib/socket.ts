import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000', {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
} 