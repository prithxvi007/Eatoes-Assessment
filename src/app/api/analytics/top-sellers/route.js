import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';
// GET /api/analytics/top-sellers - Top 5 selling menu items
export async function GET() {
  try {
    await connectDB();
    
    const topSellers = await Order.aggregate([
      // Unwind the items array
      { $unwind: '$items' },
      
      // Group by menuItem and calculate total quantity
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      
      // Sort by total quantity in descending order
      { $sort: { totalQuantity: -1 } },
      
      // Limit to top 5
      { $limit: 5 },
      
      // Lookup menu item details
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItemDetails',
        },
      },
      
      // Unwind the menuItemDetails array
      { $unwind: '$menuItemDetails' },
      
      // Project the final structure
      {
        $project: {
          _id: 0,
          menuItemId: '$_id',
          name: '$menuItemDetails.name',
          category: '$menuItemDetails.category',
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          orderCount: 1,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: topSellers,
    });
  } catch (error) {
    console.error('Error fetching top sellers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}