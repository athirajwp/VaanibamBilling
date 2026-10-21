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
    : '@page { size: A4; margin: 10mm; } .print-sheet { width: 100%; max-width: 720px; margin: 0 auto; }'

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(
      `<!doctype html><html><head><title>${payload.title}</title>` +
        `<style>${appCss}</style>` +
        `<style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            color: #111;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: ${isThermal ? '0' : '16px'};
          }
          table { border-collapse: collapse; width: 100%; }
          th, td { box-sizing: border-box; }
          @media print {
            body { background: #fff; padding: 0; }
          }
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
