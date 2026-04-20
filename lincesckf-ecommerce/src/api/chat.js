// src/api/chat.js — REST history + Socket.IO hook
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from './client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

export const fetchChatHistory = (otherId) => api.get(`/chat/${otherId}`);

/**
 * useChat(myUserId, otherUserId)
 * Manages socket connection, joining rooms, and real-time messages.
 */
export function useChat(myUserId, otherUserId) {
  const socketRef               = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // Load history
  useEffect(() => {
    if (!otherUserId) return;
    setLoading(true);
    fetchChatHistory(otherUserId)
      .then(({ messages: hist }) => { setMessages(hist); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [otherUserId]);

  // Socket connection
  useEffect(() => {
    if (!myUserId || !otherUserId) return;
    const token = localStorage.getItem('lincesckf.token');

    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', { otherId: otherUserId });
    });

    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('chatError', ({ error: e }) => setError(e));

    return () => { socket.disconnect(); };
  }, [myUserId, otherUserId]);

  const sendMessage = useCallback((body) => {
    socketRef.current?.emit('sendMessage', { receiverId: otherUserId, body });
  }, [otherUserId]);

  return { messages, loading, error, sendMessage };
}
