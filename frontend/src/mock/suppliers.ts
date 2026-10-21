import type { Supplier } from '@/types'

const now = '2026-07-01T00:00:00.000Z'

export const suppliers: Supplier[] = [
  { id: 's-001', name: 'Sri Lakshmi Fireworks Factory', phone: '99441 22334', email: 'slf.factory@gmail.com', address: 'GST Road, Sivakasi', gstin: '33AABCSL1234F1Z1', openingBalance: 0, status: 'active', createdAt: now },
  { id: 's-002', name: 'Vedika Fireworks', phone: '90031 55667', email: 'vedika@fireworks.co.in', address: 'Sattur Road, Sivakasi', gstin: '33AABCVE4567F1Z2', openingBalance: 25000, status: 'active', createdAt: now },
  { id: 's-003', name: 'Champion Pyrotech', phone: '94441 77889', email: 'sales@championpyro.in', address: 'Kamaraj Nagar, Sivakasi', gstin: '33AABCCH7890F1Z3', openingBalance: 0, status: 'active', createdAt: now },
  { id: 's-004', name: 'Classic Sparklers & Co', phone: '94861 99001', email: 'classicsparklers@gmail.com', address: 'Tiruthangal, Sivakasi', gstin: '33AABCCS1234F1Z4', openingBalance: 12000, status: 'active', createdAt: now },
  { id: 's-005', name: 'Brahmastra Fireworks', phone: '98431 22334', email: 'brahmastra@gmail.com', address: 'Vathalagundu, Dindigul', gstin: '33AABCBRA567F1Z5', openingBalance: 0, status: 'active', createdAt: now },
  { id: 's-006', name: 'Fancy Fireworks Pvt Ltd', phone: '96555 11223', email: 'fancyfw@gmail.com', address: 'Vilathikulam Road, Sivakasi', gstin: '33AABCFN890F1Z6', openingBalance: 8000, status: 'active', createdAt: now },
  { id: 's-007', name: 'Sky Craft Pyro', phone: '95001 66778', email: 'skycraft@gmail.com', address: 'Sankarankoil, Sivakasi', gstin: '33AABCSK456F1Z7', openingBalance: 0, status: 'active', createdAt: now },
  { id: 's-008', name: 'Murugan Fireworks Depot', phone: '99440 88990', email: 'muruganfw@gmail.com', address: 'Kovilpatti Road, Sivakasi', gstin: '33AABCMU789F1Z8', openingBalance: 15000, status: 'active', createdAt: now },
  { id: 's-009', name: 'Sri Amman Packers', phone: '94440 11223', email: 'ammanpackers@gmail.com', address: 'SRC Nagar, Sivakasi', gstin: '33AABCAM345F1Z9', openingBalance: 0, status: 'active', createdAt: now },
  { id: 's-010', name: 'Kannan Trading Co', phone: '95851 22334', email: 'kannantrading@gmail.com', address: 'Chokkampatti, Sivakasi', gstin: '33AABCKA567F1Z0', openingBalance: 0, status: 'inactive', createdAt: now },
]
