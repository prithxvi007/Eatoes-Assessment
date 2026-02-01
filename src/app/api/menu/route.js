import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/models/MenuItem';
export const dynamic = 'force-dynamic';
// GET /api/menu - Get all menu items with pagination
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const isAvailable = searchParams.get('isAvailable');
    const skip = (page - 1) * limit;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (isAvailable !== null) {
      query.isAvailable = isAvailable === 'true';
    }

    const [menuItems, total] = await Promise.all([
      MenuItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MenuItem.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: menuItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/menu - Create new menu item
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const menuItem = await MenuItem.create(body);

    return NextResponse.json(
      { success: true, data: menuItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}