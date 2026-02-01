'use client';

import { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Package,
  MoreVertical
} from 'lucide-react';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

const statusConfig = {
  Pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  Preparing: { icon: Package, color: 'bg-blue-100 text-blue-800', label: 'Preparing' },
  Ready: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Ready' },
  Delivered: { icon: Truck, color: 'bg-purple-100 text-purple-800', label: 'Delivered' },
  Cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' },
};

const statusOrder = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

export default function OrderCard({ order, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const StatusIcon = statusConfig[order.status].icon;
  const statusColor = statusConfig[order.status].color;

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === order.status) {
      setShowStatusMenu(false);
      return;
    }

    setIsUpdating(true);
    try {
      await ordersApi.updateStatus(order._id, newStatus);
      onStatusUpdate?.(order._id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setShowStatusMenu(false);
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateTotal = () => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-800">
                Order #{order.orderNumber}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                <StatusIcon className="h-3 w-3 inline mr-1" />
                {statusConfig[order.status].label}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Customer: <span className="font-medium">{order.customerName}</span>
            </p>
            <p className="text-sm text-gray-600">
              Table: <span className="font-medium">{order.tableNumber}</span>
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={isUpdating}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            
            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <p className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                    Update Status
                  </p>
                  {statusOrder.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        order.status === status ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {React.createElement(statusConfig[status].icon, { className: 'h-4 w-4' })}
                        <span>{status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-b border-gray-100 py-3 my-3">
          <h4 className="font-medium text-gray-700 mb-2">Order Items:</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">
                    {item.quantity}x {item.menuItem?.name || 'Menu Item'}
                  </span>
                  <p className="text-gray-500 text-xs">
                    {item.menuItem?.category}
                  </p>
                </div>
                <span className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>
              Placed: {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            {order.notes && (
              <p className="mt-1 text-xs text-gray-500">
                Note: {order.notes}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-gray-800">
              ${calculateTotal().toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Total Amount</p>
          </div>
        </div>
      </div>
    </div>
  );
}