'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Calendar,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { analyticsApi, ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'
  const [topSellers, setTopSellers] = useState([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completionRate: 0,
  });
  const [categoryStats, setCategoryStats] = useState([]);
  const [hourlyStats, setHourlyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch top sellers
      const topSellersResponse = await analyticsApi.getTopSellers();
      setTopSellers(topSellersResponse.data || []);

      // Fetch orders for stats
      const ordersResponse = await ordersApi.getAll({ limit: 1000 });
      const orders = ordersResponse.data || [];

      // Calculate order stats
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
      
      // Calculate category stats
      const categoryMap = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          const category = item.menuItem?.category || 'Unknown';
          categoryMap[category] = (categoryMap[category] || 0) + (item.quantity || 0);
        });
      });
      
      const categoryData = Object.entries(categoryMap).map(([category, count]) => ({
        category,
        count,
        percentage: (count / orders.reduce((sum, order) => 
          sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0
        )) * 100
      }));
      setCategoryStats(categoryData);

      // Calculate hourly stats (simplified)
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        orders: orders.filter(order => {
          const orderHour = order.createdAt ? new Date(order.createdAt).getHours() : 0;
          return orderHour === hour;
        }).length
      }));
      setHourlyStats(hourlyData);

      setOrderStats({
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        completionRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
      });

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${orderStats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      change: '+12.5%',
      trend: 'up',
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: orderStats.totalOrders,
      icon: ShoppingCart,
      change: '+8.3%',
      trend: 'up',
      color: 'bg-blue-500',
    },
    {
      title: 'Avg Order Value',
      value: `₹${orderStats.avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      change: '+4.2%',
      trend: 'up',
      color: 'bg-purple-500',
    },
    {
      title: 'Completion Rate',
      value: `${orderStats.completionRate.toFixed(1)}%`,
      icon: Users,
      change: '+2.1%',
      trend: 'up',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Insights and performance metrics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          {/* Export Button */}
          <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Top Selling Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellers.slice(0, 5).map((item, index) => (
                <div key={item.menuItemId || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.totalQuantity} sold</p>
                    <p className="text-sm text-gray-500">₹{item.totalRevenue?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Category Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((stat, index) => (
                <div key={stat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full" style={{
                        backgroundColor: [
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                        ][index % 5]
                      }} />
                      <span className="font-medium capitalize">{stat.category}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{
                            width: `${stat.percentage}%`,
                            backgroundColor: [
                              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                            ][index % 5]
                          }}
                        />
                      </div>
                      <span className="font-medium w-12 text-right text-sm">
                        {stat.count} ({stat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Hourly Order Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4 min-w-max">
              {hourlyStats.map((stat) => (
                <div key={stat.hour} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">{stat.hour}</div>
                  <div className="relative h-40 w-8">
                    <div 
                      className="absolute bottom-0 w-6 bg-blue-500 rounded-t"
                      style={{ height: `${(stat.orders / Math.max(...hourlyStats.map(h => h.orders))) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium mt-2">{stat.orders}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hourlyStats
                .sort((a, b) => b.orders - a.orders)
                .slice(0, 3)
                .map((stat, index) => (
                  <div key={stat.hour} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{index + 1}</span>
                      </div>
                      <span className="font-medium">{stat.hour}</span>
                    </div>
                    <span className="font-bold">{stat.orders} orders</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Average Preparation Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">18.5</div>
                <div className="text-sm text-gray-500">minutes</div>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">-2.3% from last week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Most Popular Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[5, 3, 8, 12, 6].map((table, index) => (
                <div key={table} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">{table}</span>
                    </div>
                    <span className="font-medium">Table {table}</span>
                  </div>
                  <span className="font-bold">{Math.floor(Math.random() * 20) + 10} orders</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}