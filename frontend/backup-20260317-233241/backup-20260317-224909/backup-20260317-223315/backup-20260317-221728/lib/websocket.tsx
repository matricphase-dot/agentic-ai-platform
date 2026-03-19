"use client";

import { io, Socket } from 'socket.io-client';
import { useEffect, useState, createContext, useContext } from 'react';

let socket: Socket | null = null;

export const getSocket = (token?: string) => {
  if (!socket && token) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const sock = getSocket(token);
      setSocketInstance(sock || null);
      
      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);
      
      sock?.on('connect', onConnect);
      sock?.on('disconnect', onDisconnect);

      return () => {
        sock?.off('connect', onConnect);
        sock?.off('disconnect', onDisconnect);
      };
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket: socketInstance, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
