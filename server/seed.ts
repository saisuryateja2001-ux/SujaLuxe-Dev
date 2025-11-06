import { db } from "./db";
import { retailers, customers, products } from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const retailerPassword = await hashPassword("retailer123");
  const customerPassword = await hashPassword("customer123");

  // Seed retailers
  const retailersData = await db.insert(retailers).values([
    {
      businessName: "Luxe Interiors Delhi",
      ownerName: "Rajesh Kumar",
      email: "contact@luxeinteriors.com",
      password: retailerPassword,
      contactNumber: "+91 98765 43210",
      address: "123 Connaught Place, New Delhi 110001",
      gstNumber: "07AABCU9603R1ZM",
      panNumber: "AABCU9603R",
      about: "Premium furniture and home decor solutions for luxury living spaces",
      workingHours: "Mon-Sat: 10:00 AM - 8:00 PM",
    },
    {
      businessName: "Royal Furnishings Mumbai",
      ownerName: "Priya Sharma",
      email: "info@royalfurnishings.com",
      password: retailerPassword,
      contactNumber: "+91 98765 43211",
      address: "456 Worli, Mumbai 400018",
      gstNumber: "27AABCU9603R1ZN",
      panNumber: "AABCU9603S",
      about: "Luxury furniture retailer specializing in contemporary designs",
      workingHours: "Mon-Sun: 9:00 AM - 9:00 PM",
    },
  ]).returning();

  console.log(`✓ Created ${retailersData.length} retailers`);

  // Seed customer
  const customersData = await db.insert(customers).values([
    {
      name: "Priya Malhotra",
      email: "priya.malhotra@example.com",
      password: customerPassword,
      contactNumber: "+91 98765 43212",
      address: "789 Indiranagar, Bangalore 560038",
    },
  ]).returning();

  console.log(`✓ Created ${customersData.length} customers`);

  // Seed products
  const productsData = await db.insert(products).values([
    {
      retailerId: retailersData[0].id,
      name: "Royal Velvet Sofa",
      description: "Luxurious 3-seater sofa with premium velvet upholstery in deep purple. Features solid wood frame and gold-finished legs.",
      category: "Sofa",
      price: "85000.00",
      stockQuantity: 12,
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      specifications: "Dimensions: 220cm x 90cm x 85cm | Material: Velvet, Hardwood | Weight: 65kg",
      placement: "Living Room",
      placementType: "floor",
    },
    {
      retailerId: retailersData[0].id,
      name: "Marble Dining Table",
      description: "Elegant 8-seater dining table with Italian marble top and solid wood base. Perfect for hosting dinner parties.",
      category: "Table",
      price: "125000.00",
      stockQuantity: 5,
      imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800",
      specifications: "Dimensions: 240cm x 110cm x 75cm | Material: Italian Marble, Teak Wood | Seats: 8",
      placement: "Dining Room",
      placementType: "floor",
    },
    {
      retailerId: retailersData[1].id,
      name: "Crystal Chandelier",
      description: "Stunning crystal chandelier with LED lighting. Features hand-cut crystals and gold-plated finish.",
      category: "Chandelier",
      price: "95000.00",
      stockQuantity: 8,
      imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800",
      specifications: "Dimensions: 80cm diameter x 100cm height | Material: Crystal, Brass | Bulbs: LED compatible",
      placement: "Living Room",
      placementType: "wall",
    },
    {
      retailerId: retailersData[1].id,
      name: "Luxury King Bed Frame",
      description: "Premium king-size bed frame with upholstered headboard in genuine leather. Includes storage drawers.",
      category: "Bed",
      price: "110000.00",
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800",
      specifications: "Dimensions: 200cm x 220cm x 120cm | Material: Leather, Engineered Wood | Storage: 4 drawers",
      placement: "Bedroom",
      placementType: "floor",
    },
  ]).returning();

  console.log(`✓ Created ${productsData.length} products`);

  console.log("✅ Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
