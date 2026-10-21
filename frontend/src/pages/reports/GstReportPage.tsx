import { useMemo, useState } from 'react'
import { FileText, ArrowDownCircle, ArrowUpCircle, Scale } from 'lucide-react'
import { ReportTemplate } from '@/components/reports/ReportTemplate'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { gstReportService } from '@/services/reportService'
import { formatCurrency, daysAgoISO } from '@/lib/format'

export function GstReportPage() {
  const [range, setRange] = useState({ from: daysAgoISO(29), to: daysAgoISO(0) })
  const d = useMemo(() => gstReportService.summary(range), [range])

  return (
    <ReportTemplate
      title="GST Report"
      description="Output and input tax summary"
      icon={<FileText className="h-5 w-5" />}
      range={range}
      onRangeChange={setRange}
      exportName="gst-report"
      exportRows={[
        ['Item', 'Amount'],
        ['Taxable Sales', String(d.taxableSales)],
        ['Output CGST', String(d.cgst)],
        ['Output SGST', String(d.sgst)],
        ['Output IGST', String(d.igst)],
        ['Taxable Purchases', String(d.purchaseTaxable)],
        ['Input CGST', String(d.purchaseCgst)],
        ['Input SGST', String(d.purchaseSgst)],
        ['Net GST Payable', String(d.netPayable)],
      ]}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Taxable Sales" value={formatCurrency(d.taxableSales)} icon={<ArrowUpCircle className="h-4 w-4" />} />
        <StatCard title="Output GST" value={formatCurrency(d.totalGst)} icon={<ArrowUpCircle className="h-4 w-4" />} iconClassName="bg-info/10 text-info" />
        <StatCard title="Input GST" value={formatCurrency(d.purchaseGst)} icon={<ArrowDownCircle className="h-4 w-4" />} iconClassName="bg-success/10 text-success" />
        <StatCard
          title="Net Payable"
          value={formatCurrency(Math.max(0, d.netPayable))}
          hint={d.netPayable < 0 ? 'refundable' : undefined}
          icon={<Scale className="h-4 w-4" />}
          iconClassName="bg-warning/10 text-warning"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Output Tax</p>
            <Row label="CGST (sales)" value={formatCurrency(d.cgst)} />
            <Row label="SGST (sales)" value={formatCurrency(d.sgst)} />
            <Row label="IGST (sales)" value={formatCurrency(d.igst)} />
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Output</span>
              <span className="tabular">{formatCurrency(d.totalGst)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Input Tax</p>
            <Row label="CGST (purchases)" value={formatCurrency(d.purchaseCgst)} />
            <Row label="SGST (purchases)" value={formatCurrency(d.purchaseSgst)} />
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Input</span>
              <span className="tabular">{formatCurrency(d.purchaseGst)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular text-foreground">{value}</span>
    </div>
  )
}
