// app/orders/page.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, RefreshCw, ShoppingCart, ChevronDown, ChevronUp, Search } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

const statusConfig = {
  Pending: { color: 'bg-yellow-100 text-yellow-800' },
  Preparing: { color: 'bg-blue-100 text-blue-800' },
  Ready: { color: 'bg-purple-100 text-purple-800' },
  Delivered: { color: 'bg-green-100 text-green-800' },
  Cancelled: { color: 'bg-red-100 text-red-800' }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  
  const isSearchingRef = useRef(false);
  const lastSearchRef = useRef('');

  const fetchOrders = useCallback(async (isSearch = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (selectedStatus !== 'All') {
        params.status = selectedStatus;
      }

      let response;
      if (isSearch && searchQuery.trim()) {
        // Store last search to prevent duplicate calls
        if (lastSearchRef.current === searchQuery && isSearchingRef.current) {
          return;
        }
        lastSearchRef.current = searchQuery;
        isSearchingRef.current = true;
        
        // For search, we need to fetch all orders and filter client-side
        // since the API doesn't have search endpoint for orders
        response = await ordersApi.getAll({ limit: 1000 });
        const allOrders = response.data || [];
        
        // Client-side search
        const searchResults = allOrders.filter(order => {
          const searchLower = searchQuery.toLowerCase();
          return (
            order.orderNumber?.toLowerCase().includes(searchLower) ||
            order.customerName?.toLowerCase().includes(searchLower) ||
            order.tableNumber?.toString().includes(searchQuery) ||
            order.items?.some(item => 
              item.menuItem?.name?.toLowerCase().includes(searchLower)
            )
          );
        });
        
        response.data = searchResults;
        response.pagination = {
          page: 1,
          limit: searchResults.length,
          total: searchResults.length,
          totalPages: 1
        };
      } else {
        response = await ordersApi.getAll(params);
      }

      setOrders(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  }, [pagination.page, pagination.limit, selectedStatus, searchQuery, loading]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersApi.update(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchOrders(false);
  }, [pagination.page, selectedStatus]);

  // Handle search separately
  useEffect(() => {
    if (searchQuery !== undefined) {
      const delayDebounceFn = setTimeout(() => {
        fetchOrders(!!searchQuery.trim());
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery]);

  // Calculate stats
  const stats = orders.reduce((acc, order) => {
    acc.total += order.totalAmount || 0;
    acc.count++;
    if (order.status in acc.byStatus) {
      acc.byStatus[order.status]++;
    }
    return acc;
  }, { 
    total: 0, 
    count: 0, 
    byStatus: { Pending: 0, Preparing: 0, Ready: 0, Delivered: 0, Cancelled: 0 } 
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search by order #, customer, table..." 
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
                setSearchQuery(''); // Clear search when changing status
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[150px]"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => fetchOrders(false)}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
        
        {/* Stats Summary */}
        <div className="flex flex-wrap gap-3">
          {searchQuery && (
            <div className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
              Search: "{searchQuery}"
            </div>
          )}
          {selectedStatus !== 'All' && (
            <div className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm">
              Status: {selectedStatus}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{stats.count}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold">₹{stats.total.toFixed(2)}</p>
        </div>
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <div key={status} className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">{status}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : selectedStatus !== 'All' 
              ? `No orders with status "${selectedStatus}"`
              : 'No orders have been placed yet'}
          </p>
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{order.orderNumber}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {order.customerName} • Table {order.tableNumber}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{order.totalAmount?.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                      <button
                        onClick={() => toggleOrderExpand(order._id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedOrder === order._id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {expandedOrder === order._id && (
                    <div className="pt-4 border-t">
                      {/* Order Items */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-800">{item.menuItem?.name}</p>
                                <p className="text-sm text-gray-600">{item.menuItem?.category}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{item.price} × {item.quantity}</p>
                                <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details and Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          {order.notes && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-700 mb-1">Notes:</h5>
                              <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">{order.notes}</p>
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            <p>Order placed: {new Date(order.createdAt).toLocaleString()}</p>
                            <p>Last updated: {new Date(order.updatedAt).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Status Actions */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">Update Status</h5>
                          <div className="flex flex-wrap gap-2">
                            {['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(order._id, status)}
                                disabled={order.status === status}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                  order.status === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Only show for non-search results */}
          {!searchQuery && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} orders
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-lg ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Showing {orders.length} search results for "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchOrders(false);
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}