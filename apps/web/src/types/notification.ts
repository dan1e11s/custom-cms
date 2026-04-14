export interface Notification {
  id: number
  userId: number
  type: 'like' | 'post_comment' | 'comment_reply' | 'forum_reply'
  payload: {
    actorName: string
    text: string
    url: string
  }
  isRead: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}
