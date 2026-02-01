import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  category: z.enum(['Appetizer', 'Main Course', 'Dessert', 'Beverage']),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  ingredients: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().min(1, 'Preparation time must be at least 1 minute'),
  imageUrl: z.string().url('Invalid URL').optional(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    menuItem: z.string().min(1, 'Menu item is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })),
  customerName: z.string().min(1, 'Customer name is required'),
  tableNumber: z.number().min(1, 'Table number must be at least 1'),
  notes: z.string().optional(),
});