export interface UpdateStatus {
  available: boolean
  currentVersion: string
  latestVersion?: string
  checking: boolean
}

export interface AppInfo {
  name: string
  version: string
  description: string
}

export async function getAppInfo(): Promise<AppInfo> {
  return {
    name: 'BizFlow',
    version: '1.0.0',
    description: 'Simple Billing. Smart Business.',
  }
}

export async function checkForUpdates(): Promise<UpdateStatus> {
  return {
    available: false,
    currentVersion: '1.0.0',
    checking: false,
  }
}
