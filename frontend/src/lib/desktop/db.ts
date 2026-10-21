import { desktop } from './index'

export interface DbResult<T> {
  ok: boolean
  data: T | null
  message?: string
}

export class LocalDb {
  private readonly prefix = 'bizflow:'

  private key(name: string): string {
    return this.prefix + name
  }

  async get<T>(name: string): Promise<DbResult<T>> {
    try {
      const raw = localStorage.getItem(this.key(name))
      if (!raw) return { ok: true, data: null }
      return { ok: true, data: JSON.parse(raw) as T }
    } catch (err) {
      return { ok: false, data: null, message: String(err) }
    }
  }

  async set<T>(name: string, value: T): Promise<DbResult<T>> {
    try {
      localStorage.setItem(this.key(name), JSON.stringify(value))
      return { ok: true, data: value }
    } catch (err) {
      return { ok: false, data: null, message: String(err) }
    }
  }

  async remove(name: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.key(name))
      return true
    } catch {
      return false
    }
  }

  async clearAll(): Promise<boolean> {
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(this.prefix)) keys.push(k)
      }
      keys.forEach((k) => localStorage.removeItem(k))
      return true
    } catch {
      return false
    }
  }
}

export const db = new LocalDb()
export { desktop }
