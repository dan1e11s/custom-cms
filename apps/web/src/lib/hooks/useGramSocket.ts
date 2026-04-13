'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'
import type { GramPost, GramComment } from '@/types/gram'

interface GramSocketCallbacks {
  onNewPost?: (post: GramPost) => void
  onLikeUpdate?: (data: { postId: number; count: number }) => void
  onNewComment?: (data: { postId: number; comment: GramComment }) => void
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000'

export function useGramSocket(callbacks: GramSocketCallbacks) {
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
      socket.emit('gram:join')
    })

    if (callbacks.onNewPost) {
      socket.on('gram:new_post', callbacks.onNewPost)
    }
    if (callbacks.onLikeUpdate) {
      socket.on('gram:like_update', callbacks.onLikeUpdate)
    }
    if (callbacks.onNewComment) {
      socket.on('gram:new_comment', callbacks.onNewComment)
    }

    return () => {
      socket.emit('gram:leave')
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  return socketRef
}
