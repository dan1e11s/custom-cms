'use client'

import { useCallback, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'
import type { ForumPost } from '@/types/forum'

interface ForumSocketCallbacks {
  threadId: number
  onNewPost?: (post: ForumPost) => void
  onUserTyping?: (data: { threadId: number; username: string }) => void
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000'

export function useForumSocket({ threadId, onNewPost, onUserTyping }: ForumSocketCallbacks) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(`${WS_URL}/ws`, {
      auth: accessToken ? { token: accessToken } : {},
      transports: ['websocket'],
      reconnectionDelay: 2000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('forum:join', threadId)
    })

    if (onNewPost) socket.on('forum:new_post', onNewPost)
    if (onUserTyping) socket.on('forum:user_typing', onUserTyping)

    return () => {
      socket.emit('forum:leave', threadId)
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, accessToken])

  /** Emit события "пользователь печатает" */
  const emitTyping = useCallback(() => {
    socketRef.current?.emit('forum:typing', threadId)
  }, [threadId])

  return { emitTyping }
}
