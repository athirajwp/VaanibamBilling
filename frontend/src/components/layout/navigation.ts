import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  Package,
  Boxes,
  Users,
  Truck,
  Wallet,
  BarChart3,
  Globe,
  Settings,
  FileText,
  Undo2,
  Layers,
  ArrowLeftRight,
  Warehouse,
  UserRound,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  children?: NavItem[]
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Billing',
    path: '/billing',
    icon: Receipt,
    children: [
      { label: 'New Sale', path: '/billing', icon: Receipt },
      { label: 'Invoices', path: '/sales/invoices', icon: FileText },
      { label: 'Quotations', path: '/sales/quotations', icon: ClipboardList },
      { label: 'Sales Returns', path: '/sales/returns', icon: Undo2 },
    ],
  },
  {
    label: 'Sales',
    path: '/sales',
    icon: ShoppingCart,
    children: [
      { label: 'Invoices', path: '/sales/invoices', icon: FileText },
      { label: 'Quotations', path: '/sales/quotations', icon: ClipboardList },
      { label: 'Returns', path: '/sales/returns', icon: Undo2 },
    ],
  },
  {
    label: 'Purchases',
    path: '/purchases',
    icon: ShoppingBag,
    children: [
      { label: 'Overview', path: '/purchases', icon: ShoppingBag },
      { label: 'Purchase Bills', path: '/purchases/bills', icon: FileText },
      { label: 'Purchase Returns', path: '/purchases/returns', icon: Undo2 },
    ],
  },
  {
    label: 'Products',
    path: '/products',
    icon: Package,
    children: [
      { label: 'Products List', path: '/products/list', icon: Package },
      { label: 'Categories', path: '/products/categories', icon: Layers },
    ],
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Boxes,
    children: [
      { label: 'Stock', path: '/inventory/stock', icon: Boxes },
      { label: 'Adjustments', path: '/inventory/adjustments', icon: ArrowLeftRight },
      { label: 'Godowns', path: '/inventory/godowns', icon: Warehouse },
    ],
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: Users,
    children: [
      { label: 'Customers List', path: '/customers/list', icon: Users },
      { label: 'Ledger', path: '/customers/ledger', icon: UserRound },
    ],
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    icon: Truck,
    children: [
      { label: 'Suppliers List', path: '/suppliers/list', icon: Truck },
      { label: 'Ledger', path: '/suppliers/ledger', icon: ClipboardList },
    ],
  },
  { label: 'Expenses', path: '/expenses', icon: Wallet },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    children: [
      { label: 'Report Center', path: '/reports', icon: BarChart3 },
      { label: 'Sales', path: '/reports/sales', icon: BarChart3 },
      { label: 'Purchases', path: '/reports/purchases', icon: ShoppingBag },
      { label: 'Profit & Loss', path: '/reports/profit', icon: BarChart3 },
      { label: 'Inventory', path: '/reports/inventory', icon: Boxes },
      { label: 'Customers', path: '/reports/customers', icon: Users },
      { label: 'GST', path: '/reports/gst', icon: FileText },
    ],
  },
  { label: 'Online Store', path: '/online-store', icon: Globe },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    children: [
      { label: 'Business', path: '/settings/business', icon: Settings },
      { label: 'Invoice', path: '/settings/invoice', icon: FileText },
      { label: 'Users', path: '/settings/users', icon: Users },
      { label: 'Printer', path: '/settings/printer', icon: ShoppingBag },
      { label: 'Taxes', path: '/settings/taxes', icon: Wallet },
    ],
  },
]

export const shortcuts = [
  { label: 'F1', action: 'New Sale', hint: 'Open the billing screen' },
  { label: 'F2', action: 'Search Product', hint: 'Focus product search' },
  { label: 'F3', action: 'Customer', hint: 'Focus customer selector' },
  { label: 'F4', action: 'Hold Sale', hint: 'Hold current sale' },
  { label: 'F5', action: 'Payment', hint: 'Open payment modal' },
  { label: 'F6', action: 'Print', hint: 'Print current document' },
  { label: 'Esc', action: 'Close Modal', hint: 'Close dialogs' },
  { label: 'Ctrl+S', action: 'Save', hint: 'Save current document' },
]
