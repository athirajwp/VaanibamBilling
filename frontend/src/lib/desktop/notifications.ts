import { desktop } from './index'

export interface NotificationPayload {
  title: string
  body: string
  silent?: boolean
}

export async function notify(payload: NotificationPayload): Promise<boolean> {
  if (desktop.isTauri) {
    // TODO: hook up tauri-plugin-notification when available
    console.info('[desktop/notifications]', payload.title, payload.body)
    return true
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(payload.title, { body: payload.body, silent: payload.silent })
      return true
    } catch {
      return false
    }
  }

  console.info('[notifications]', payload.title, payload.body)
  return false
}

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}
