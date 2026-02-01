import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/models/MenuItem';

export const dynamic = 'force-dynamic';
// GET /api/menu/[id] - Get single menu item
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const menuItem = await MenuItem.findById(params.id);
    
    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/menu/[id] - Update menu item
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const menuItem = await MenuItem.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/[id] - Delete menu item
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const menuItem = await MenuItem.findByIdAndDelete(params.id);

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/menu/[id]/availability - Toggle availability
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const menuItem = await MenuItem.findById(params.id);
    
    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    return NextResponse.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Error toggling availability:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}