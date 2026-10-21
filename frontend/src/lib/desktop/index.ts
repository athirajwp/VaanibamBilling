export interface DesktopCapability {
  name: string
  available: boolean
  provider: 'tauri' | 'mock' | 'web'
}

export interface DesktopBridge {
  isTauri: boolean
  platform: string
  capabilities: () => Promise<DesktopCapability[]>
}

function detect(): DesktopBridge {
  const isTauri =
    typeof window !== 'undefined' &&
    '__TAURI_INTERNALS__' in window

  return {
    isTauri,
    platform: isTauri ? 'desktop' : 'web',
    capabilities: async () => [
      { name: 'printer', available: false, provider: isTauri ? 'tauri' : 'web' },
      { name: 'fileSystem', available: false, provider: isTauri ? 'tauri' : 'web' },
      { name: 'localDatabase', available: isTauri, provider: isTauri ? 'tauri' : 'web' },
      { name: 'autoUpdate', available: false, provider: isTauri ? 'tauri' : 'web' },
      { name: 'notifications', available: false, provider: isTauri ? 'tauri' : 'web' },
    ],
  }
}

export const desktop = detect()
