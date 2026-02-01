// app/menu/page.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Filter, Search, Grid, List, RefreshCw } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MenuItemCard from '@/components/MenuItemCard';
import MenuItemForm from '@/components/MenuItemForm';
import { menuApi } from '@/lib/api';
import toast from 'react-hot-toast';

// Dynamically import modal
const DynamicModal = dynamic(() => import('@/components/ui/Modal'), {
  ssr: false,
  loading: () => null,
});

const CATEGORIES = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Beverage'];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAvailable, setShowAvailable] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  
  const isSearchingRef = useRef(false);
  const lastSearchRef = useRef('');

  const fetchMenuItems = useCallback(async (isSearch = false) => {
    // Prevent multiple simultaneous calls
    if (loading) return;
    
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      if (!showAvailable) {
        params.isAvailable = false;
      }

      let response;
      if (isSearch && searchQuery.trim()) {
        // Store last search to prevent duplicate calls
        if (lastSearchRef.current === searchQuery && isSearchingRef.current) {
          return;
        }
        lastSearchRef.current = searchQuery;
        isSearchingRef.current = true;
        
        response = await menuApi.search(searchQuery);
        // Reset pagination for search results
        setPagination(prev => ({ ...prev, page: 1, total: response.data?.length || 0 }));
      } else {
        response = await menuApi.getAll(params);
        setPagination(response.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 1,
        });
      }

      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  }, [pagination.page, pagination.limit, selectedCategory, showAvailable, searchQuery, loading]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    // Reset to page 1 for new searches
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await menuApi.update(editingItem._id, formData);
        toast.success('Menu item updated successfully');
      } else {
        await menuApi.create(formData);
        toast.success('Menu item created successfully');
      }
      setShowModal(false);
      fetchMenuItems(false); // Refresh list
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await menuApi.delete(id);
        toast.success('Menu item deleted successfully');
        setMenuItems(prev => prev.filter(item => item._id !== id));
      } catch (error) {
        toast.error('Failed to delete menu item');
      }
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await menuApi.update(id, { isAvailable: !currentStatus });
      toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'}`);
      setMenuItems(prev =>
        prev.map(item =>
          item._id === id ? { ...item, isAvailable: !currentStatus } : item
        )
      );
    } catch (error) {
      toast.error('Failed to update item status');
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchMenuItems(false);
  }, [pagination.page, selectedCategory, showAvailable]);

  // Handle search separately
  useEffect(() => {
    if (searchQuery !== undefined) {
      const delayDebounceFn = setTimeout(() => {
        fetchMenuItems(!!searchQuery.trim());
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery]);

  // Available items count
  const availableCount = menuItems.filter(item => item.isAvailable).length;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant menu</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors w-full lg:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search by name, description, ingredients..." 
          />
          
          <div className="flex flex-wrap items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                  setSearchQuery(''); // Clear search when changing category
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[150px]"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAvailable}
                onChange={(e) => {
                  setShowAvailable(e.target.checked);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-gray-700 text-sm">Available Only</span>
            </label>

            {/* Refresh Button */}
            <button
              onClick={() => fetchMenuItems(false)}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
            Total: {menuItems.length}
          </div>
          <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
            Available: {availableCount}
          </div>
          {searchQuery && (
            <div className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
              Search: "{searchQuery}"
            </div>
          )}
          {selectedCategory !== 'All' && (
            <div className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm">
              Category: {selectedCategory}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No menu items found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : selectedCategory !== 'All'
              ? `No items in ${selectedCategory} category`
              : 'Add your first menu item to get started'}
          </p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <>
          {/* Grid/List View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {menuItems.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Image */}
                    <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gray-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/foodplaceholder.png';
                            e.target.className = 'w-full h-full object-contain p-4';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">₹{item.price}</div>
                          <div className={`px-2 py-1 text-xs rounded-full inline-block mt-1 ${
                            item.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {item.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {item.preparationTime} mins prep
                        </span>
                      </div>
                      
                      {item.ingredients?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">Ingredients:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.ingredients.slice(0, 5).map((ing, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded">
                                {ing}
                              </span>
                            ))}
                            {item.ingredients.length > 5 && (
                              <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                                +{item.ingredients.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggle(item._id, item.isAvailable)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          {item.isAvailable ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination - Only show for non-search results */}
          {!searchQuery && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} items
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show only nearby pages
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                    ) {
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
                    }
                    if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                Showing {menuItems.length} search results for "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchMenuItems(false);
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <DynamicModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? 'Edit Menu Item' : 'Create Menu Item'}
          size="md"
        >
          <MenuItemForm
            initialData={editingItem}
            onSubmit={handleSave}
            onCancel={() => setShowModal(false)}
          />
        </DynamicModal>
      )}
    </div>
  );
}