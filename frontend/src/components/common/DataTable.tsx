import * as React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from './EmptyState'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: React.ReactNode
  className?: string
  headerClassName?: string
  render: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: (row: T) => string
  onRowClick?: (row: T) => void
  empty?: React.ReactNode
  stickyHeader?: boolean
  footer?: React.ReactNode
  containerClassName?: string
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  onRowClick,
  empty,
  stickyHeader = true,
  footer,
  containerClassName,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-hidden', containerClassName)}>
      <div className={cn('overflow-auto', stickyHeader && 'max-h-[calc(100vh-260px)]')}>
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10 bg-card shadow-sm')}>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length}>
                  {empty ?? (
                    <EmptyState title="No records found" description="Try changing your search or filters." />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={keyField(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {footer && <div className="border-t px-4 py-3">{footer}</div>}
    </div>
  )
}
