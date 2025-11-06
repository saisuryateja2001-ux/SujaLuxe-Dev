import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(), // 'retailer' or 'customer'
  createdAt: timestamp("created_at").defaultNow(),
});

// Retailers
export const retailers = pgTable("retailers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  contactNumber: text("contact_number").notNull(),
  address: text("address").notNull(),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  logoUrl: text("logo_url"),
  about: text("about"),
  workingHours: text("working_hours"),
  bankDetails: text("bank_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customers
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  contactNumber: text("contact_number"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retailerId: varchar("retailer_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  imageUrl: text("image_url"),
  specifications: text("specifications"), // JSON string
  placement: text("placement"), // Room placement (Living Room, Bedroom, etc.)
  placementType: text("placement_type").notNull(), // 'wall' or 'floor'
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default('pending'), // pending, completed, failed
  orderStatus: text("order_status").notNull().default('pending'), // pending, confirmed, shipped, delivered, cancelled
  deliveryAddress: text("delivery_address").notNull(),
  shippingPartner: text("shipping_partner"),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  remarks: text("remarks"),
  orderDate: timestamp("order_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order Items (supports multi-product orders)
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  retailerId: varchar("retailer_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Auctions
export const auctions = pgTable("auctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  retailerId: varchar("retailer_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  startPrice: decimal("start_price", { precision: 10, scale: 2 }).notNull(),
  currentHighestBid: decimal("current_highest_bid", { precision: 10, scale: 2 }),
  currentBidderId: varchar("current_bidder_id"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  numberOfBidders: integer("number_of_bidders").default(0),
  status: text("status").notNull().default('active'), // active, ended, cancelled
  winnerId: varchar("winner_id"),
  paymentStatus: text("payment_status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bids
export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auctionId: varchar("auction_id").notNull(),
  bidderId: varchar("bidder_id").notNull(),
  bidAmount: decimal("bid_amount", { precision: 10, scale: 2 }).notNull(),
  bidDate: timestamp("bid_date").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  retailerId: varchar("retailer_id").notNull(),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  response: text("response"),
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  reviewDate: timestamp("review_date").defaultNow(),
});

// Marketing Campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retailerId: varchar("retailer_id").notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  productsIncluded: text("products_included"), // JSON array of product IDs
  bannerImageUrl: text("banner_image_url"),
  status: text("status").notNull().default('draft'), // draft, active, ended
  visibilityLevel: text("visibility_level").notNull().default('public'), // public, private
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  userType: text("user_type").notNull(), // 'retailer' or 'customer'
  type: text("type").notNull(), // order_received, low_stock, auction_ending, payment_received, review_posted, campaign_expiry
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  relatedId: varchar("related_id"), // ID of related entity (order, auction, etc)
  createdAt: timestamp("created_at").defaultNow(),
});

// Negotiations
export const negotiations = pgTable("negotiations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  retailerId: varchar("retailer_id").notNull(),
  productId: varchar("product_id").notNull(),
  status: text("status").notNull().default('active'), // active, accepted, rejected, closed
  createdAt: timestamp("created_at").defaultNow(),
});

// Negotiation Messages
export const negotiationMessages = pgTable("negotiation_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  negotiationId: varchar("negotiation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderType: text("sender_type").notNull(), // 'customer' or 'retailer'
  message: text("message").notNull(),
  offerPrice: decimal("offer_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Room Designs
export const roomDesigns = pgTable("room_designs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  productId: varchar("product_id").notNull(),
  roomType: text("room_type").notNull(), // living room, bedroom, dining room, etc
  theme: text("theme").notNull(), // elegant, cozy, sophisticated, etc
  style: text("style").notNull(), // modern, contemporary, traditional, etc
  placementType: text("placement_type").notNull(), // floor, wall
  imageUrl: text("image_url").notNull(), // Generated image URL from DALL-E
  saved: boolean("saved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping Cart
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertRetailerSchema = createInsertSchema(retailers).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, orderDate: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true });
export const insertAuctionSchema = createInsertSchema(auctions).omit({ id: true, createdAt: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, bidDate: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, reviewDate: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertNegotiationSchema = createInsertSchema(negotiations).omit({ id: true, createdAt: true });
export const insertNegotiationMessageSchema = createInsertSchema(negotiationMessages).omit({ id: true, createdAt: true });
export const insertRoomDesignSchema = createInsertSchema(roomDesigns).omit({ id: true, createdAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });

// Types
export type Retailer = typeof retailers.$inferSelect;
export type InsertRetailer = z.infer<typeof insertRetailerSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = z.infer<typeof insertAuctionSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Negotiation = typeof negotiations.$inferSelect;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;

export type NegotiationMessage = typeof negotiationMessages.$inferSelect;
export type InsertNegotiationMessage = z.infer<typeof insertNegotiationMessageSchema>;

export type RoomDesign = typeof roomDesigns.$inferSelect;
export type InsertRoomDesign = z.infer<typeof insertRoomDesignSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
