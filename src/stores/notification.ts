import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Notification, NotificationKind } from '@/types/notification'
import type { ID } from '@/types/common'

let nextId = 1
const mkId = (): ID<'NTF'> => `NTF-${String(Date.now()).slice(-8)}-${nextId++}`

export const useNotificationStore = defineStore(
  'notification',
  () => {
    const items = ref<Notification[]>([])

    const unreadCount = computed(() => items.value.filter((n) => !n.readAt).length)
    const latest = computed(() => [...items.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))

    function push(
      recipientId: Notification['recipientId'],
      kind: NotificationKind,
      content: { titleTh: string; titleEn: string; bodyTh: string; bodyEn: string; link?: string },
    ) {
      const n: Notification = {
        id: mkId(),
        recipientId,
        kind,
        createdAt: new Date().toISOString(),
        ...content,
      }
      items.value.unshift(n)
      if (items.value.length > 50) items.value = items.value.slice(0, 50)
      return n
    }

    function markRead(id: ID<'NTF'>) {
      const n = items.value.find((x) => x.id === id)
      if (n && !n.readAt) n.readAt = new Date().toISOString()
    }

    function markAllRead() {
      const ts = new Date().toISOString()
      items.value.forEach((n) => {
        if (!n.readAt) n.readAt = ts
      })
    }

    return { items, unreadCount, latest, push, markRead, markAllRead }
  },
  { persist: true },
)
