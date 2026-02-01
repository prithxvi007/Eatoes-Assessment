import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
export const dynamic = 'force-dynamic';


// GET /api/orders/[id] - Get single order
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const order = await Order.findById(params.id)
      .populate('items.menuItem', 'name category price imageUrl');
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { status, ...otherData } = body;
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { ...otherData, ...(status && { status }) },
      { new: true, runValidators: true }
    ).populate('items.menuItem', 'name category price imageUrl');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const order = await Order.findByIdAndDelete(params.id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}