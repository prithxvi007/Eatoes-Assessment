import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import MenuItem from '@/models/MenuItem';
export const dynamic = 'force-dynamic';
// GET /api/orders - Get all orders with pagination and filtering
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.menuItem', 'name category price imageUrl'),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.items || !body.customerName || !body.tableNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate items exist and are available
    const itemIds = body.items.map(item => item.menuItem);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } });
    
    if (menuItems.length !== itemIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some menu items not found' },
        { status: 404 }
      );
    }

    // Check if all items are available
    const unavailableItems = menuItems.filter(item => !item.isAvailable);
    if (unavailableItems.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Some items are unavailable: ${unavailableItems.map(item => item.name).join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Create order with calculated prices
    const orderData = {
      ...body,
      items: body.items.map(item => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItems.find(mi => mi._id.toString() === item.menuItem).price
      }))
    };

    const order = await Order.create(orderData);
    
    // Populate menu item details
    await order.populate('items.menuItem', 'name category price imageUrl');

    return NextResponse.json(
      { success: true, data: order },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}