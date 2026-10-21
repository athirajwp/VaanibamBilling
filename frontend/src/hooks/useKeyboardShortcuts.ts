import { useEffect, useState } from 'react'

type Handler = (e: KeyboardEvent) => void

interface ShortcutBinding {
  key: string
  handler: Handler
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  enabled?: boolean
}

export function useKeyboardShortcuts(bindings: ShortcutBinding[]) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      for (const binding of bindings) {
        if (binding.enabled === false) continue
        const ctrlOk = !!binding.ctrl === (e.ctrlKey || e.metaKey)
        const altOk = !!binding.alt === e.altKey
        const shiftOk = !!binding.shift === e.shiftKey
        if (
          e.key.toLowerCase() === binding.key.toLowerCase() &&
          ctrlOk &&
          altOk &&
          shiftOk
        ) {
          if (binding.ctrl && typing) {
            e.preventDefault()
          }
          binding.handler(e)
          break
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [bindings])
}

export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
