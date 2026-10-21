export interface FileSystemCapability {
  available: boolean
  method: 'download' | 'unavailable'
}

export async function downloadJson(filename: string, data: unknown): Promise<FileSystemCapability> {
  if (typeof document === 'undefined') {
    return { available: false, method: 'unavailable' }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return { available: true, method: 'download' }
}

export async function downloadCsv(filename: string, rows: string[][]): Promise<FileSystemCapability> {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return { available: true, method: 'download' }
}
