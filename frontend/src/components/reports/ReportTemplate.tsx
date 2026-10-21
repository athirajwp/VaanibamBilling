import * as React from 'react'
import { Download, Printer } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DateRangePicker } from '@/components/common/DateRangePicker'
import { Button } from '@/components/ui/button'
import type { DateRange } from '@/services/reportService'
import { downloadCsv } from '@/lib/desktop/fs'
import { toast } from '@/stores/useToastStore'

interface ReportTemplateProps {
  title: string
  description: string
  icon: React.ReactNode
  range: DateRange
  onRangeChange: (range: DateRange) => void
  exportName: string
  exportRows?: string[][]
  children: React.ReactNode
  extra?: React.ReactNode
}

export function ReportTemplate({
  title,
  description,
  icon,
  range,
  onRangeChange,
  exportName,
  exportRows,
  children,
  extra,
}: ReportTemplateProps) {
  const handleExport = async () => {
    if (exportRows) {
      await downloadCsv(`${exportName}.csv`, exportRows)
      toast.success('Report exported', `${exportName}.csv downloaded.`)
    } else {
      toast.info('Nothing to export', 'No rows in the selected period.')
    }
  }

  return (
    <div>
      <PageHeader title={title} description={description} icon={icon}>
        <DateRangePicker value={range} onChange={onRangeChange} />
        {extra}
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Print', `${title} sent to printer.`)}>
          <Printer className="h-4 w-4" /> Print
        </Button>
      </PageHeader>
      <div className="p-4">{children}</div>
    </div>
  )
}
