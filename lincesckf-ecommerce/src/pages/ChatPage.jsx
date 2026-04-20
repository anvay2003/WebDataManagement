// ChatPage.jsx — Phase 3: Real-time chat using Socket.IO + Node.js
// Matches original site styling (gold/ink/card classes)

import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/auth.jsx'
import { useI18n } from '../i18n/i18n.jsx'
import { api } from '../api/client.js'
import { MessageCircle, Send, User2, WifiOff } from 'lucide-react'

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

export default function ChatPage() {
  const { user, isAuthed } = useAuth()
  const { t } = useI18n()
  const socketRef    = useRef(null)
  const selectedRef  = useRef(null)   // keeps a live reference to selected user
  const bottomRef    = useRef(null)

  const [users,       setUsers]       = useState([])
  const [selected,    setSelected]    = useState(null)
  const [messages,    setMessages]    = useState([])
  const [draft,       setDraft]       = useState('')
  const [loading,     setLoading]     = useState(true)
  const [socketReady, setSocketReady] = useState(false)
  const [socketError, setSocketError] = useState(null)

  // Keep selectedRef in sync with selected state
  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  // ── Load user list from backend ──────────────────────────
  useEffect(() => {
    if (!isAuthed) return
    api.get('/users')
      .then(({ users: u }) => { setUsers(u); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isAuthed])

  // ── Socket.IO connection ─────────────────────────────────
  useEffect(() => {
    if (!isAuthed) return

    const token = localStorage.getItem('lincesckf.token')
    if (!token) {
      setSocketError('No session token found. Please log out and log back in.')
      return
    }

    const socket = io(SOCKET_URL, {
      auth:                { token },
      transports:          ['websocket', 'polling'], // polling as fallback for UTA Cloud
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setSocketReady(true)
      setSocketError(null)
      // Use ref so we always have the latest selected value (not a stale closure)
      if (selectedRef.current) {
        socket.emit('joinRoom', { otherId: selectedRef.current.id })
      }
    })

    socket.on('connect_error', (err) => {
      setSocketReady(false)
      setSocketError(`Connection error: ${err.message}`)
    })

    socket.on('disconnect', () => {
      setSocketReady(false)
    })

    socket.on('newMessage', (msg) => {
      // Only append if this message belongs to the currently open conversation
      const other = selectedRef.current
      if (!other) return

      // Use Number() for safe comparison regardless of type (int, string, BigInt)
      const myId    = Number(user.id)
      const otherId = Number(other.id)
      const senderId   = Number(msg.sender_id)
      const receiverId = Number(msg.receiver_id)

      const isRelevant =
        (senderId === myId    && receiverId === otherId) ||
        (senderId === otherId && receiverId === myId)

      if (!isRelevant) return

      // Deduplicate by ID to prevent double-append when history fetch races
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
    })

    socket.on('chatError', ({ error: e }) => {
      console.error('[Chat] server error:', e)
      setSocketError(e)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isAuthed])

  // ── Load history + join room when a user is selected ────
  useEffect(() => {
    if (!selected || !user) return

    // Load message history from REST endpoint
    setMessages([])  // clear previous conversation first
    api.get(`/chat/${selected.id}`)
      .then(({ messages: hist }) => {
        // Merge history with any real-time msgs that arrived during the fetch
        setMessages(prev => {
          const ids = new Set(hist.map(m => m.id))
          const extras = prev.filter(m => !ids.has(m.id))
          return [...hist, ...extras]
        })
      })
      .catch(() => setMessages([]))

    // Join socket room — handle both already-connected and pending-connection cases
    const socket = socketRef.current
    if (!socket) return

    if (socket.connected) {
      socket.emit('joinRoom', { otherId: selected.id })
    } else {
      // Socket exists but not yet connected — join once it connects
      socket.once('connect', () => {
        socket.emit('joinRoom', { otherId: selected.id })
      })
    }
  }, [selected, user])

  // ── Auto-scroll to latest message ───────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ─────────────────────────────────────────
  const sendMessage = (e) => {
    e.preventDefault()
    if (!draft.trim() || !selected) return

    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', {
        receiverId: selected.id,
        body:       draft.trim(),
      })
      setDraft('')
    } else {
      setSocketError('Not connected to chat server. Please refresh and try again.')
    }
  }

  // Safely get the display name for a user object (handles both snake_case from
  // the /users list and camelCase from the auth context)
  const displayName = (u) =>
    u.full_name || u.fullName || u.company_name || u.companyName || u.email

  // ── Not logged in ────────────────────────────────────────
  if (!isAuthed) {
    return (
      <section className="container-page py-20 text-center">
        <MessageCircle className="h-16 w-16 mx-auto text-ink/20 mb-4" />
        <h1 className="font-display text-2xl">Chat</h1>
        <p className="mt-2 muted">Please log in to use the chat.</p>
        <Link to="/" className="btn-gold mt-6 inline-block">{t('authLogin')}</Link>
      </section>
    )
  }

  return (
    <section className="container-page py-12">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-display text-3xl">Messages</h1>

        {/* Connection status badge */}
        <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full font-semibold ${
          socketReady
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-600'
        }`}>
          <span className={`h-2 w-2 rounded-full ${socketReady ? 'bg-green-500' : 'bg-red-500'}`} />
          {socketReady ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Socket error banner */}
      {socketError && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          <span>{socketError}</span>
        </div>
      )}

      <div className="card overflow-hidden grid md:grid-cols-[260px_1fr]" style={{ height: '68vh' }}>

        {/* ── Sidebar: user list ── */}
        <div className="border-r border-black/10 overflow-y-auto flex flex-col">
          <div className="px-4 py-3 bg-black/3 border-b border-black/10">
            <p className="text-xs uppercase tracking-widest font-semibold text-ink/50">Conversations</p>
          </div>

          {loading ? (
            <p className="text-center muted text-sm py-10">Loading…</p>
          ) : users.length === 0 ? (
            <p className="text-center muted text-sm py-10">No other users yet.</p>
          ) : (
            users.map(u => (
              <button key={u.id} type="button"
                onClick={() => setSelected(u)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-black/5 transition hover:bg-black/5 ${selected?.id === u.id ? 'bg-gold/10' : ''}`}
              >
                <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <User2 className="h-4 w-4 text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{displayName(u)}</p>
                  <p className="text-xs muted capitalize">{u.account_type}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* ── Chat window ── */}
        {selected ? (
          <div className="flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-black/10">
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                <User2 className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="font-semibold text-sm">{displayName(selected)}</p>
                <p className="text-xs muted capitalize">{selected.account_type}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <p className="text-center muted text-sm py-10">No messages yet. Say hello! 👋</p>
              )}
              {messages.map((msg) => {
                // Compare as Numbers to avoid any type mismatch (int vs string vs BigInt)
                const isOwn = Number(msg.sender_id) === Number(user.id)
                return (
                  <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    {/* Only show sender name for the other person's messages */}
                    {!isOwn && (
                      <p className="text-xs text-ink/40 mb-1 px-1">{msg.sender_name}</p>
                    )}
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isOwn ? 'bg-gold text-white rounded-br-sm' : 'bg-black/8 text-ink rounded-bl-sm'}`}>
                      <p className="leading-relaxed">{msg.body}</p>
                      <p className={`text-xs mt-1 opacity-60 ${isOwn ? 'text-right' : ''}`}>
                        {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="flex items-center gap-3 px-5 py-4 border-t border-black/10">
              <input
                className="input flex-1 text-sm"
                placeholder={socketReady ? 'Type a message…' : 'Waiting for connection…'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                disabled={!socketReady}
                autoFocus
              />
              <button
                type="submit"
                className="btn-gold p-3 rounded-xl"
                disabled={!draft.trim() || !socketReady}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full muted gap-3">
            <MessageCircle className="h-12 w-12 opacity-20" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </section>
  )
}
