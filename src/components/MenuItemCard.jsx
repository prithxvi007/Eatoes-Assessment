// components/MenuItemCard.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit, Trash2, Eye, EyeOff, Clock, Tag } from 'lucide-react';

export default function MenuItemCard({ item, onEdit, onDelete, onToggle }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
      {/* Image Section */}
      <div className="relative h-48 w-full bg-gray-100">
        {item.imageUrl && !imageError ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
            priority={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center p-4">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <span className="text-gray-500 text-sm">No image available</span>
            </div>
          </div>
        )}
        
        {/* Availability Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
          item.isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
          {item.category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Name and Price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-lg truncate">{item.name}</h3>
          <span className="font-bold text-gray-900 text-lg">₹{item.price}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

        {/* Details */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{item.preparationTime} mins</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{item.ingredients?.length || 0} ingredients</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm font-medium">Edit</span>
          </button>
          <button
            onClick={() => onToggle(item._id, item.isAvailable)}
            className="flex-1 flex items-center justify-center space-x-1 bg-gray-50 text-gray-600 hover:bg-gray-100 py-2 rounded-lg transition-colors"
          >
            {item.isAvailable ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="text-sm font-medium">Hide</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Show</span>
              </>
            )}
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="flex-1 flex items-center justify-center space-x-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm font-medium">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}