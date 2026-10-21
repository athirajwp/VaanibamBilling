import type { Customer } from '@/types'

const now = '2026-07-01T00:00:00.000Z'

export const customers: Customer[] = [
  { id: 'c-001', name: 'Walk-in Customer', phone: '', status: 'active', createdAt: now },
  { id: 'c-002', name: 'Kumar Stores', phone: '98422 11223', email: 'kumar.stores@gmail.com', address: 'Tirunelveli Junction, Tirunelveli', gstin: '33AABCK1234F1Z5', creditLimit: 50000, openingBalance: 0, status: 'active', createdAt: now },
  { id: 'c-003', name: 'Lakshmi Traders', phone: '94431 44556', email: 'lakshmitraders@yahoo.com', address: 'Madurai Main Road, Madurai', gstin: '33AABCL5678G1Z8', creditLimit: 75000, openingBalance: 2500, status: 'active', createdAt: now },
  { id: 'c-004', name: 'Sri Venkateshwara Agencies', phone: '99941 22110', email: 'venkateshwara@gmail.com', address: 'Kamaraj Road, Kovilpatti', gstin: '33AABCV9012H1Z2', creditLimit: 40000, openingBalance: 0, status: 'active', createdAt: now },
  { id: 'c-005', name: 'Raja Supermarket', phone: '94861 77889', email: 'raja.supermarket@gmail.com', address: 'Virudhunagar, Tamil Nadu', gstin: '33AACCR3456J1Z7', creditLimit: 60000, openingBalance: 12000, status: 'active', createdAt: now },
  { id: 'c-006', name: 'Ganesh Provision Stores', phone: '94441 55667', email: 'ganeshprovision@rediffmail.com', address: 'Sankarankovil Road, Tenkasi', gstin: '33AACCG7890K1Z4', creditLimit: 35000, openingBalance: 0, status: 'active', createdAt: now },
  { id: 'c-007', name: 'Murugan Distributors', phone: '98431 00998', email: 'murugandist@gmail.com', address: 'Nellai Bazaar, Tirunelveli', gstin: '33AACCM1234L1Z9', creditLimit: 90000, openingBalance: 3000, status: 'active', createdAt: now },
  { id: 'c-008', name: 'Bharathi Crackers Palace', phone: '96555 11223', email: 'bharathicrackers@gmail.com', address: 'Aruppukottai, Tamil Nadu', gstin: '33AACCB5678M1Z1', creditLimit: 80000, openingBalance: 0, status: 'active', createdAt: now },
  { id: 'c-009', name: 'Arun General Store', phone: '99441 33445', email: '', address: 'Srivilliputhur, Tamil Nadu', gstin: '33AACCA9012N1Z5', creditLimit: 25000, openingBalance: 5000, status: 'active', createdAt: now },
  { id: 'c-010', name: 'Devi Stores', phone: '90031 23456', email: 'devistores@gmail.com', address: 'Rajapalayam, Tamil Nadu', gstin: '33AACCD3456P1Z3', creditLimit: 45000, openingBalance: 0, status: 'active', createdAt: now },
  { id: 'c-011', name: 'Senthil Mobile Point', phone: '95001 56789', email: '', address: 'Periyar Street, Tirunelveli', gstin: '33AACCS7890Q1Z8', creditLimit: 30000, openingBalance: 1500, status: 'active', createdAt: now },
  { id: 'c-012', name: 'Mani Hardware & Sanitary', phone: '98430 88776', email: 'manihardware@gmail.com', address: 'Court Road, Sankarankovil', gstin: '33AACCM1234R1Z6', creditLimit: 55000, openingBalance: 0, status: 'active', createdAt: now },
  { id: 'c-013', name: 'Annalakshmi Textiles', phone: '94440 11223', email: 'annalakshmi.textiles@gmail.com', address: 'Textile Market, Kovilpatti', gstin: '33AACCA5678S1Z2', creditLimit: 70000, openingBalance: 8000, status: 'active', createdAt: now },
  { id: 'c-014', name: 'Ponnar Sweet Mart', phone: '95851 44556', email: '', address: 'Tenkasi Main Road, Tenkasi', gstin: '33AACCP9012T1Z7', creditLimit: 20000, openingBalance: 0, status: 'inactive', createdAt: now },
  { id: 'c-015', name: 'Velan Wholesale Mart', phone: '98431 66778', email: 'velanmart@gmail.com', address: 'Thiruvalluvar Street, Madurai', gstin: '33AACCV3456U1Z9', creditLimit: 100000, openingBalance: 12000, status: 'active', createdAt: now },
]
