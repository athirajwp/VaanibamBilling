import type { Expense } from '@/types'
import { daysAgoISO } from '@/lib/format'

const templates: [string, string, number][] = [
  ['Rent', 'Shop rent - Main Street', 12000],
  ['Salary', 'Cashier salary - Rajesh', 15000],
  ['Salary', 'Helper salary - Kumar', 9000],
  ['Electricity', 'EB bill - store', 3400],
  ['Transport', 'Delivery van diesel', 2200],
  ['Transport', 'Goods auto - Sivakasi to Madurai', 1800],
  ['Marketing', 'Festival banner & posters', 3500],
  ['Maintenance', 'Rack repair', 800],
  ['Other', 'Tea & refreshments for staff', 600],
  ['Marketing', 'WhatsApp catalogue ads', 1500],
  ['Electricity', 'EB bill - godown', 1900],
  ['Maintenance', 'CCTV camera service', 1200],
  ['Transport', 'Loading charges - Godown', 900],
  ['Other', 'Stationery & bills books', 450],
  ['Salary', 'Accountant salary - Priya', 12000],
  ['Rent', 'Godown rent', 8000],
  ['Marketing', 'Radio ad - Deepavali offer', 6000],
  ['Other', 'License renewal fees', 2500],
  ['Maintenance', 'Generator service', 1800],
  ['Transport', 'Truck hire - Kovilpatti', 2600],
]

export const expenses: Expense[] = templates.map(([category, description, amount], i) => ({
  id: `exp-${i + 1}`,
  date: daysAgoISO(i),
  category,
  description,
  amount,
  paymentMethod: ['cash', 'upi', 'bank', 'cash', 'upi'][i % 5],
  status: i % 7 === 3 ? 'pending' : 'paid',
  createdAt: daysAgoISO(i) + 'T12:00:00.000Z',
}))

export const expenseCategories = [
  'Rent',
  'Salary',
  'Electricity',
  'Transport',
  'Marketing',
  'Maintenance',
  'Other',
]

export const paymentMethods = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque', 'Credit']
