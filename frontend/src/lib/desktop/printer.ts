export interface PrintPayload {
  title: string
  html: string
  paperSize?: 'a4' | 'thermal' | '80mm'
  copies?: number
}

export interface PrinterCapability {
  supported: boolean
  papers: string[]
  method: string
}

function collectAppCss(): string {
  try {
    const sheets = Array.from(document.styleSheets)
    let css = ''
    for (const sheet of sheets) {
      try {
        const rules = sheet.cssRules
        if (!rules) continue
        for (let i = 0; i < rules.length; i++) {
          css += rules[i].cssText + '\n'
        }
      } catch {
        // Cross-origin stylesheet - skip
      }
    }
    return css
  } catch {
    return ''
  }
}

export async function printDocument(payload: PrintPayload): Promise<PrinterCapability> {
  if (typeof window === 'undefined') {
    return { supported: false, papers: [], method: 'unavailable' }
  }

  const isThermal = payload.paperSize === 'thermal' || payload.paperSize === '80mm'
  const appCss = collectAppCss()

  const pageCss = isThermal
    ? '@page { size: 80mm auto; margin: 0; } body { padding: 4mm; } .print-sheet { width: 72mm; margin: 0 auto; }'
    : '@page { size: A4; margin: 12mm; }'

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(
      `<!doctype html><html><head><title>${payload.title}</title>` +
        `<style>${appCss}</style>` +
        `<style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { color: #111; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @media print { body { background: #fff; } }
          ${pageCss}
        </style>` +
        `</head><body><div class="print-sheet">${payload.html}</div></body></html>`,
    )
    win.document.close()
    win.focus()
    window.setTimeout(() => win.print(), 300)
  }

  return {
    supported: typeof window.print === 'function',
    papers: ['a4', 'thermal', '80mm'],
    method: 'browser-print',
  }
}
