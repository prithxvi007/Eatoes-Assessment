'use client';

import { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Clock,
  Package,
  CheckCircle,
  Truck,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ordersApi, analyticsApi } from '@/lib/api';
import toast from 'react-hot-toast';

// Status configuration for styling
const statusConfig = {
  Pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  Preparing: {
    color: 'bg-blue-100 text-blue-800',
    icon: Package
  },
  Ready: {
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle
  },
  Delivered: {
    color: 'bg-green-100 text-green-800',
    icon: Truck
  },
  Cancelled: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
  });
  
  const [statusDistribution, setStatusDistribution] = useState({});
  const [topSellers, setTopSellers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders for stats
      const ordersResponse = await ordersApi.getAll({ limit: 100 });
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data?.orders || [];
      
      if (!Array.isArray(orders)) {
        toast.error('Invalid orders data format');
        return;
      }
      
      // Calculate stats
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const pendingOrders = orders.filter(order => 
        ['Pending', 'Preparing'].includes(order.status)
      ).length;
      
      // Calculate status distribution
      const distribution = orders.reduce((acc, order) => {
        const status = order.status || 'Pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // Get recent orders
      const recent = [...orders]
        .sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0))
        .slice(0, 5);
      
      // Get top sellers
      try {
        const topSellersResponse = await analyticsApi.getTopSellers();
        setTopSellers(Array.isArray(topSellersResponse.data) ? topSellersResponse.data.slice(0, 5) : []);
      } catch (error) {
        console.error('Failed to fetch top sellers:', error);
        setTopSellers([]);
      }
      
      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      });
      
      setStatusDistribution(distribution);
      setRecentOrders(recent);
      
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+18%',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-5%',
    },
    {
      title: 'Avg Order Value',
      value: `₹${stats.averageOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+8%',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your restaurant admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.keys(statusConfig).map((status) => {
                const count = statusDistribution[status] || 0;
                const Icon = statusConfig[status].icon;
                const percentage = stats.totalOrders > 0 
                  ? Math.round((count / stats.totalOrders) * 100) 
                  : 0;
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium capitalize">{status}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="font-medium w-12 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellers.length > 0 ? (
                topSellers.map((item, index) => (
                  <div key={item.menuItemId || item._id || index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <UtensilsCrossed className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name || 'Unknown Item'}</p>
                        <p className="text-sm text-gray-500 capitalize">{item.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.totalQuantity || 0} sold</p>
                      <p className="text-sm text-gray-500">₹{item.totalRevenue?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No top sellers data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Table</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{order.orderNumber || 'N/A'}</td>
                        <td className="py-3 px-4">{order.customerName || 'Unknown'}</td>
                        <td className="py-3 px-4">{order.tableNumber || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {order.createdAt ? 
                            new Date(order.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}