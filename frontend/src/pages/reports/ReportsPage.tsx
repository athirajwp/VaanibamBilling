import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  Boxes,
  Users,
  FileText,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const reports = [
  { title: 'Sales Report', description: 'Revenue, orders and collection', path: '/reports/sales', icon: ShoppingCart, accent: 'text-primary bg-primary/10' },
  { title: 'Purchase Report', description: 'Spend by supplier and bill', path: '/reports/purchases', icon: ShoppingBag, accent: 'text-info bg-info/10' },
  { title: 'Profit & Loss', description: 'Revenue, COGS, expenses and margin', path: '/reports/profit', icon: TrendingUp, accent: 'text-success bg-success/10' },
  { title: 'Inventory Report', description: 'Stock value and levels', path: '/reports/inventory', icon: Boxes, accent: 'text-warning bg-warning/10' },
  { title: 'Customer Report', description: 'Top customers and outstanding', path: '/reports/customers', icon: Users, accent: 'text-primary bg-primary/10' },
  { title: 'GST Report', description: 'Output and input tax summary', path: '/reports/gst', icon: FileText, accent: 'text-success bg-success/10' },
  { title: 'Expense Report', description: 'Spending by category', path: '/reports/profit', icon: Wallet, accent: 'text-destructive bg-destructive/10' },
]

export function ReportsPage() {
  const navigate = useNavigate()
  return (
    <div>
      <PageHeader
        title="Report Center"
        description="Business insights at a glance"
        icon={<BarChart3 className="h-5 w-5" />}
      />
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Card
            key={r.title}
            className="cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            onClick={() => navigate(r.path)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-sm">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${r.accent}`}>
                  <r.icon className="h-4 w-4" />
                </span>
                {r.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">{r.description}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
