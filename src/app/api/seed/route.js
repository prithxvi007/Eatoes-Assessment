import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([MenuItem.deleteMany({}), Order.deleteMany({})]);

    // Create sample menu items (INR pricing – India realistic)
    const menuItems = await MenuItem.insertMany([
      {
        name: "Garlic Bread",
        description: "Freshly baked bread with garlic butter and herbs",
        category: "Appetizer",
        price: 199,
        ingredients: ["French Bread", "Garlic", "Butter", "Parsley", "Oregano"],
        isAvailable: true,
        preparationTime: 10,
        imageUrl: "https://www.ambitiouskitchen.com/wp-content/uploads/2023/02/Garlic-Bread-4.jpg",
      },
      {
        name: "Caesar Salad",
        description: "Crisp romaine lettuce with Caesar dressing, croutons, and parmesan",
        category: "Appetizer",
        price: 299,
        ingredients: [
          "Romaine Lettuce",
          "Croutons",
          "Parmesan Cheese",
          "Caesar Dressing",
          "Lemon Juice",
        ],
        isAvailable: true,
        preparationTime: 15,
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP.8UagT3WWGxruvIOqJTCPeQHaE8?pid=Api&P=0&h=180",
      },
      {
        name: "Grilled Salmon",
        description: "Atlantic salmon fillet grilled to perfection with lemon butter sauce",
        category: "Main Course",
        price: 899,
        ingredients: [
          "Salmon Fillet",
          "Lemon",
          "Butter",
          "Dill",
          "Garlic",
          "Olive Oil",
        ],
        isAvailable: true,
        preparationTime: 25,
        imageUrl: "https://www.thecookierookie.com/wp-content/uploads/2023/05/grilled-salmon-recipe-2.jpg",
      },
      {
        name: "Beef Burger",
        description: "Juicy Angus beef patty with cheese, fresh veggies, and special sauce",
        category: "Main Course",
        price: 449,
        ingredients: [
          "Angus Beef Patty",
          "Cheddar Cheese",
          "Lettuce",
          "Tomato",
          "Onion",
          "Pickles",
          "Burger Bun",
        ],
        isAvailable: true,
        preparationTime: 20,
        imageUrl: "https://tse4.mm.bing.net/th/id/OIP.OvLU3z2b6vcj7AQ3fNm4wAHaE8?pid=Api&P=0&h=180",
      },
      {
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella, tomato sauce, and basil",
        category: "Main Course",
        price: 349,
        ingredients: [
          "Pizza Dough",
          "Tomato Sauce",
          "Mozzarella Cheese",
          "Fresh Basil",
          "Olive Oil",
        ],
        isAvailable: true,
        preparationTime: 15,
        imageUrl: "https://i.pinimg.com/originals/57/e7/a1/57e7a19334571946391a7430fcb86202.png",
      },
      {
        name: "Chicken Alfredo Pasta",
        description: "Fettuccine pasta with creamy Alfredo sauce and grilled chicken",
        category: "Main Course",
        price: 399,
        ingredients: [
          "Fettuccine",
          "Chicken Breast",
          "Heavy Cream",
          "Parmesan Cheese",
          "Garlic",
          "Butter",
        ],
        isAvailable: true,
        preparationTime: 22,
        imageUrl: "https://tse1.mm.bing.net/th/id/OIP.aaNEFf5zKUoblF2xEnOfQgHaFj?pid=Api&P=0&h=180",
      },
      {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with a molten chocolate center, served with vanilla ice cream",
        category: "Dessert",
        price: 249,
        ingredients: [
          "Dark Chocolate",
          "Butter",
          "Eggs",
          "Sugar",
          "Flour",
          "Vanilla Ice Cream",
        ],
        isAvailable: true,
        preparationTime: 15,
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP.omB8qWT2A-LDLi7QUqC2xwHaFD?pid=Api&P=0&h=180",
      },
      {
        name: "New York Cheesecake",
        description: "Classic creamy cheesecake with graham cracker crust",
        category: "Dessert",
        price: 279,
        ingredients: [
          "Cream Cheese",
          "Graham Crackers",
          "Sugar",
          "Eggs",
          "Sour Cream",
          "Vanilla",
        ],
        isAvailable: true,
        preparationTime: 10,
        imageUrl: "https://tse1.mm.bing.net/th/id/OIP.Pqo18O_JVaGnjepussOSCwHaE7?pid=Api&P=0&h=180",
      },
      {
        name: "Cappuccino",
        description: "Freshly brewed espresso with steamed milk foam",
        category: "Beverage",
        price: 149,
        ingredients: ["Espresso", "Steamed Milk", "Milk Foam", "Cocoa Powder"],
        isAvailable: true,
        preparationTime: 5,
        imageUrl: "https://tse4.mm.bing.net/th/id/OIP.GdvAxxpnqVtW1HtpuQWA8wHaEo?pid=Api&P=0&h=180",
      },
      {
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice served chilled",
        category: "Beverage",
        price: 179,
        ingredients: ["Fresh Oranges"],
        isAvailable: true,
        preparationTime: 5,
        imageUrl: "https://tse4.mm.bing.net/th/id/OIP.kxzvbAvoWNgLy8mENLyReAHaE8?pid=Api&P=0&h=180",
      },
      {
        name: "Mojito Mocktail",
        description: "Refreshing mint and lime mocktail",
        category: "Beverage",
        price: 199,
        ingredients: [
          "Fresh Mint",
          "Lime",
          "Sugar",
          "Soda Water",
          "Crushed Ice",
        ],
        isAvailable: true,
        preparationTime: 8,
        imageUrl: "https://i.pinimg.com/736x/57/cd/dd/57cddd925ee9c23164c2cfb69faf0e92.jpg",
      },
      {
        name: "Sparkling Water",
        description: "Premium sparkling water with lemon slice",
        category: "Beverage",
        price: 99,
        ingredients: ["Sparkling Water", "Lemon Slice"],
        isAvailable: true,
        preparationTime: 2,
        imageUrl: "https://tse2.mm.bing.net/th/id/OIP.3ii8zGfWCcxlA_ZoekchwAHaE8?pid=Api&P=0&h=180",
      },
    ]);

    // Helper function to calculate total amount for an order
    const calculateTotalAmount = (orderData) => {
      return orderData.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    };

    // Create sample orders with manually calculated totalAmount
    const ordersData = [
      {
        items: [
          {
            menuItem: menuItems[0]._id,
            quantity: 2,
            price: menuItems[0].price,
          },
          {
            menuItem: menuItems[2]._id,
            quantity: 1,
            price: menuItems[2].price,
          },
          {
            menuItem: menuItems[6]._id,
            quantity: 1,
            price: menuItems[6].price,
          },
        ],
        customerName: "John Doe",
        tableNumber: 5,
        status: "Delivered",
        notes: "Extra napkins please",
      },
      {
        items: [
          {
            menuItem: menuItems[1]._id,
            quantity: 1,
            price: menuItems[1].price,
          },
          {
            menuItem: menuItems[3]._id,
            quantity: 2,
            price: menuItems[3].price,
          },
          {
            menuItem: menuItems[7]._id,
            quantity: 1,
            price: menuItems[7].price,
          },
        ],
        customerName: "Jane Smith",
        tableNumber: 3,
        status: "Preparing",
      },
      {
        items: [
          {
            menuItem: menuItems[4]._id,
            quantity: 1,
            price: menuItems[4].price,
          },
          {
            menuItem: menuItems[9]._id,
            quantity: 2,
            price: menuItems[9].price,
          },
        ],
        customerName: "Bob Johnson",
        tableNumber: 8,
        status: "Ready",
      },
      {
        items: [
          {
            menuItem: menuItems[5]._id,
            quantity: 3,
            price: menuItems[5].price,
          },
          {
            menuItem: menuItems[8]._id,
            quantity: 3,
            price: menuItems[8].price,
          },
        ],
        customerName: "Alice Brown",
        tableNumber: 12,
        status: "Pending",
        notes: "No onions in the pasta please",
      },
      {
        items: [
          {
            menuItem: menuItems[2]._id,
            quantity: 2,
            price: menuItems[2].price,
          },
          {
            menuItem: menuItems[10]._id,
            quantity: 4,
            price: menuItems[10].price,
          },
        ],
        customerName: "Charlie Wilson",
        tableNumber: 6,
        status: "Delivered",
      },
      {
        items: [
          {
            menuItem: menuItems[1]._id,
            quantity: 3,
            price: menuItems[1].price,
          },
          {
            menuItem: menuItems[11]._id,
            quantity: 3,
            price: menuItems[11].price,
          },
        ],
        customerName: "David Lee",
        tableNumber: 4,
        status: "Cancelled",
        notes: "Customer requested cancellation",
      },
      {
        items: [
          {
            menuItem: menuItems[3]._id,
            quantity: 1,
            price: menuItems[3].price,
          },
          {
            menuItem: menuItems[4]._id,
            quantity: 1,
            price: menuItems[4].price,
          },
          {
            menuItem: menuItems[6]._id,
            quantity: 2,
            price: menuItems[6].price,
          },
        ],
        customerName: "Emma Davis",
        tableNumber: 9,
        status: "Delivered",
      },
      {
        items: [
          {
            menuItem: menuItems[0]._id,
            quantity: 4,
            price: menuItems[0].price,
          },
          {
            menuItem: menuItems[5]._id,
            quantity: 2,
            price: menuItems[5].price,
          },
        ],
        customerName: "Frank Miller",
        tableNumber: 11,
        status: "Preparing",
      },
      {
        items: [
          {
            menuItem: menuItems[7]._id,
            quantity: 1,
            price: menuItems[7].price,
          },
          {
            menuItem: menuItems[9]._id,
            quantity: 1,
            price: menuItems[9].price,
          },
        ],
        customerName: "Grace Taylor",
        tableNumber: 7,
        status: "Ready",
      },
      {
        items: [
          {
            menuItem: menuItems[8]._id,
            quantity: 5,
            price: menuItems[8].price,
          },
          {
            menuItem: menuItems[10]._id,
            quantity: 5,
            price: menuItems[10].price,
          },
        ],
        customerName: "Henry Clark",
        tableNumber: 2,
        status: "Pending",
        notes: "All drinks with no sugar",
      },
    ];

    // Add totalAmount to each order
    const ordersWithTotals = ordersData.map(order => ({
      ...order,
      totalAmount: calculateTotalAmount(order)
    }));

    // Insert orders into database
    const orders = await Order.insertMany(ordersWithTotals);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        menuItems: menuItems.length,
        orders: orders.length,
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}