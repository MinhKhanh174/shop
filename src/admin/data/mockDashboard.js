export const mockDashboard = {
  totalRevenue: 248500000,
  totalOrders: 126,
  totalCustomers: 84,
  lowStockProducts: [
    {
      id: 'p-1001',
      name: 'iPhone 15 Pro Max 256GB',
      stock: 4,
    },
    {
      id: 'p-1002',
      name: 'MacBook Air M3 13"',
      stock: 2,
    },
    {
      id: 'p-1003',
      name: 'AirPods Pro 2',
      stock: 6,
    },
  ],
  recentOrders: [
    {
      id: 'ORD-2048',
      customerName: 'Nguyen Van A',
      total: 32990000,
      status: 'paid',
      createdAt: '2026-07-01T09:15:00.000Z',
    },
    {
      id: 'ORD-2047',
      customerName: 'Tran Thi B',
      total: 18990000,
      status: 'processing',
      createdAt: '2026-07-01T08:45:00.000Z',
    },
    {
      id: 'ORD-2046',
      customerName: 'Le Van C',
      total: 7990000,
      status: 'shipped',
      createdAt: '2026-06-30T18:30:00.000Z',
    },
  ],
  topProducts: [
    {
      id: 'tp-01',
      name: 'iPhone 15 Pro Max 256GB',
      sold: 28,
      revenue: 919720000,
      stock: 4,
    },
    {
      id: 'tp-02',
      name: 'Samsung Galaxy S24 Ultra',
      sold: 18,
      revenue: 449820000,
      stock: 11,
    },
    {
      id: 'tp-03',
      name: 'MacBook Air M3 13"',
      sold: 12,
      revenue: 329880000,
      stock: 2,
    },
    {
      id: 'tp-04',
      name: 'AirPods Pro 2',
      sold: 31,
      revenue: 71469000,
      stock: 6,
    },
  ],
}
