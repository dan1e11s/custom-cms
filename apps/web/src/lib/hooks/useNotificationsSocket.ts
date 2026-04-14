'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'
import type { Notification } from '@/types/notification'

interface NotificationsSocketCallbacks {
  onNotification: (n: Notification) => void
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000'

export function useNotificationsSocket({ onNotification }: NotificationsSocketCallbacks) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!accessToken) return

    const socket = io(`${WS_URL}/ws`, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnectionDelay: 2000,
    })

    socketRef.current = socket
    socket.on('notification', onNotification)

    return () => {
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])
}
