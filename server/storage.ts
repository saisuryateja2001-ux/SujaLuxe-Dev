import {
  type Retailer, type InsertRetailer,
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Auction, type InsertAuction,
  type Bid, type InsertBid,
  type Review, type InsertReview,
  type Campaign, type InsertCampaign,
  type Notification, type InsertNotification,
  type Negotiation, type InsertNegotiation,
  type NegotiationMessage, type InsertNegotiationMessage,
  type RoomDesign, type InsertRoomDesign,
  type CartItem, type InsertCartItem,
  retailers as retailersTable,
  customers as customersTable,
  products as productsTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  auctions as auctionsTable,
  bids as bidsTable,
  reviews as reviewsTable,
  campaigns as campaignsTable,
  notifications as notificationsTable,
  negotiations as negotiationsTable,
  negotiationMessages as negotiationMessagesTable,
  roomDesigns as roomDesignsTable,
  cartItems as cartItemsTable,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, like, or } from "drizzle-orm";

export interface IStorage {
  // Retailers
  getRetailer(id: string): Promise<Retailer | undefined>;
  getRetailerByEmail(email: string): Promise<Retailer | undefined>;
  getAllRetailers(): Promise<Retailer[]>;
  createRetailer(retailer: InsertRetailer): Promise<Retailer>;
  updateRetailer(id: string, retailer: Partial<InsertRetailer>): Promise<Retailer | undefined>;
  deleteRetailer(id: string): Promise<boolean>;

  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByRetailer(retailerId: string): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByRetailer(retailerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;

  // Order Items
  getOrderItem(id: string): Promise<OrderItem | undefined>;
  getOrderItemsByOrder(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  deleteOrderItem(id: string): Promise<boolean>;

  // Auctions
  getAuction(id: string): Promise<Auction | undefined>;
  getAllAuctions(): Promise<Auction[]>;
  getAuctionsByCustomer(customerId: string): Promise<Auction[]>;
  getAuctionsByRetailer(retailerId: string): Promise<Auction[]>;
  getActiveAuctions(): Promise<Auction[]>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  updateAuction(id: string, auction: Partial<InsertAuction>): Promise<Auction | undefined>;
  closeAuction(id: string, winnerId: string): Promise<Auction | undefined>;

  // Bids
  getBid(id: string): Promise<Bid | undefined>;
  getBidsByAuction(auctionId: string): Promise<Bid[]>;
  getBidsByRetailer(retailerId: string): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;

  // Reviews
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByProduct(productId: string): Promise<Review[]>;
  getReviewsByRetailer(retailerId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;

  // Campaigns
  getCampaign(id: string): Promise<Campaign | undefined>;
  getCampaignsByRetailer(retailerId: string): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;

  // Notifications
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByUser(userId: string, userType: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  deleteNotification(id: string): Promise<boolean>;

  // Negotiations
  getNegotiation(id: string): Promise<Negotiation | undefined>;
  getNegotiationsByCustomer(customerId: string): Promise<Negotiation[]>;
  getNegotiationsByRetailer(retailerId: string): Promise<Negotiation[]>;
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  updateNegotiation(id: string, negotiation: Partial<InsertNegotiation>): Promise<Negotiation | undefined>;

  // Negotiation Messages
  getNegotiationMessage(id: string): Promise<NegotiationMessage | undefined>;
  getMessagesByNegotiation(negotiationId: string): Promise<NegotiationMessage[]>;
  createNegotiationMessage(message: InsertNegotiationMessage): Promise<NegotiationMessage>;

  // Room Designs
  getRoomDesign(id: string): Promise<RoomDesign | undefined>;
  getRoomDesignsByCustomer(customerId: string): Promise<RoomDesign[]>;
  createRoomDesign(roomDesign: InsertRoomDesign): Promise<RoomDesign>;
  deleteRoomDesign(id: string): Promise<boolean>;

  // Cart Items
  getCartItem(id: string): Promise<CartItem | undefined>;
  getCartItemsByCustomer(customerId: string): Promise<any[]>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, cartItem: Partial<InsertCartItem>): Promise<CartItem | undefined>;
  deleteCartItem(id: string): Promise<boolean>;
  clearCart(customerId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private retailers: Map<string, Retailer>;
  private customers: Map<string, Customer>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private auctions: Map<string, Auction>;
  private bids: Map<string, Bid>;
  private reviews: Map<string, Review>;
  private campaigns: Map<string, Campaign>;
  private notifications: Map<string, Notification>;
  private negotiations: Map<string, Negotiation>;
  private negotiationMessages: Map<string, NegotiationMessage>;
  private roomDesigns: Map<string, RoomDesign>;
  private cartItems: Map<string, CartItem>;

  constructor() {
    this.retailers = new Map();
    this.customers = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.auctions = new Map();
    this.bids = new Map();
    this.reviews = new Map();
    this.campaigns = new Map();
    this.notifications = new Map();
    this.negotiations = new Map();
    this.negotiationMessages = new Map();
    this.roomDesigns = new Map();
    this.cartItems = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Seed sample retailers
    const retailer1: Retailer = {
      id: "ret-1",
      businessName: "Luxe Interiors Delhi",
      email: "contact@luxeinteriors.com",
      password: "password123",
      phone: "+91 98765 43210",
      address: "123 Connaught Place, New Delhi 110001",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      gstNumber: "07AABCU9603R1ZM",
      logo: null,
      businessType: "furniture",
      createdAt: new Date(),
    };

    const retailer2: Retailer = {
      id: "ret-2",
      businessName: "Royal Furnishings Mumbai",
      email: "info@royalfurnishings.com",
      password: "password123",
      phone: "+91 98765 43211",
      address: "456 Worli, Mumbai 400018",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400018",
      gstNumber: "27AABCU9603R1ZN",
      logo: null,
      businessType: "furniture",
      createdAt: new Date(),
    };

    this.retailers.set(retailer1.id, retailer1);
    this.retailers.set(retailer2.id, retailer2);

    // Seed sample customer
    const customer1: Customer = {
      id: "cust-1",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      password: "password123",
      phone: "+91 98765 43212",
      address: "789 Indiranagar, Bangalore 560038",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560038",
      createdAt: new Date(),
    };

    this.customers.set(customer1.id, customer1);

    // Seed sample products
    const products: Product[] = [
      {
        id: "prod-1",
        retailerId: "ret-1",
        name: "Royal Velvet Sofa",
        description: "Luxurious 3-seater sofa with premium velvet upholstery",
        category: "Sofa",
        price: "85000.00",
        stockQuantity: 12,
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
        specifications: "Dimensions: 220cm x 90cm x 85cm",
        placement: "Living Room",
        placementType: "floor",
        createdAt: new Date(),
      },
      {
        id: "prod-2",
        retailerId: "ret-1",
        name: "Marble Dining Table",
        description: "Elegant 8-seater dining table with Italian marble top",
        category: "Table",
        price: "125000.00",
        stockQuantity: 5,
        imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200",
        specifications: "Dimensions: 240cm x 110cm x 75cm",
        placement: "Dining Room",
        placementType: "floor",
        createdAt: new Date(),
      },
      {
        id: "prod-3",
        retailerId: "ret-2",
        name: "Crystal Chandelier",
        description: "Stunning crystal chandelier with LED lighting",
        category: "Chandelier",
        price: "95000.00",
        stockQuantity: 8,
        imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261",
        specifications: "Diameter: 80cm, Height: 120cm",
        placement: "Dining Room",
        placementType: "wall",
        createdAt: new Date(),
      },
      {
        id: "prod-4",
        retailerId: "ret-2",
        name: "Luxury King Bed Frame",
        description: "Premium king-size bed frame with tufted headboard",
        category: "Bed",
        price: "110000.00",
        stockQuantity: 3,
        imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
        specifications: "Dimensions: 200cm x 200cm x 130cm",
        placement: "Bedroom",
        placementType: "floor",
        createdAt: new Date(),
      },
    ];

    products.forEach(p => this.products.set(p.id, p));
  }

  // Retailers
  async getRetailer(id: string): Promise<Retailer | undefined> {
    return this.retailers.get(id);
  }

  async getRetailerByEmail(email: string): Promise<Retailer | undefined> {
    return Array.from(this.retailers.values()).find(r => r.email === email);
  }

  async getAllRetailers(): Promise<Retailer[]> {
    return Array.from(this.retailers.values());
  }

  async createRetailer(insertRetailer: InsertRetailer): Promise<Retailer> {
    const id = randomUUID();
    const retailer: Retailer = { ...insertRetailer, id, createdAt: new Date() };
    this.retailers.set(id, retailer);
    return retailer;
  }

  async updateRetailer(id: string, update: Partial<InsertRetailer>): Promise<Retailer | undefined> {
    const retailer = this.retailers.get(id);
    if (!retailer) return undefined;
    const updated: Retailer = { ...retailer, ...update };
    this.retailers.set(id, updated);
    return updated;
  }

  async deleteRetailer(id: string): Promise<boolean> {
    return this.retailers.delete(id);
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.email === email);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { ...insertCustomer, id, createdAt: new Date() };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, update: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    const updated: Customer = { ...customer, ...update };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByRetailer(retailerId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.retailerId === retailerId);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id, createdAt: new Date() };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, update: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated: Product = { ...product, ...update };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.customerId === customerId);
  }

  async getOrdersByRetailer(retailerId: string): Promise<Order[]> {
    const orderItems = Array.from(this.orderItems.values()).filter(oi => oi.retailerId === retailerId);
    const orderIds = new Set(orderItems.map(oi => oi.orderId));
    return Array.from(this.orders.values()).filter(o => orderIds.has(o.id));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { ...insertOrder, id, orderDate: new Date(), createdAt: new Date() };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, update: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated: Order = { ...order, ...update };
    this.orders.set(id, updated);
    return updated;
  }

  // Order Items
  async getOrderItem(id: string): Promise<OrderItem | undefined> {
    return this.orderItems.get(id);
  }

  async getOrderItemsByOrder(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(oi => oi.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = { ...insertOrderItem, id, createdAt: new Date() };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async deleteOrderItem(id: string): Promise<boolean> {
    return this.orderItems.delete(id);
  }

  // Auctions
  async getAuction(id: string): Promise<Auction | undefined> {
    return this.auctions.get(id);
  }

  async getAllAuctions(): Promise<Auction[]> {
    return Array.from(this.auctions.values());
  }

  async getAuctionsByCustomer(customerId: string): Promise<Auction[]> {
    return Array.from(this.auctions.values()).filter(a => a.customerId === customerId);
  }

  async getAuctionsByRetailer(retailerId: string): Promise<Auction[]> {
    const bids = Array.from(this.bids.values()).filter(b => b.retailerId === retailerId);
    const auctionIds = new Set(bids.map(b => b.auctionId));
    return Array.from(this.auctions.values()).filter(a => auctionIds.has(a.id));
  }

  async getActiveAuctions(): Promise<Auction[]> {
    const now = new Date();
    return Array.from(this.auctions.values()).filter(a => {
      const endDate = new Date(a.endDate);
      return a.status === 'active' && endDate > now;
    });
  }

  async createAuction(insertAuction: InsertAuction): Promise<Auction> {
    const id = randomUUID();
    const auction: Auction = { ...insertAuction, id, createdAt: new Date() };
    this.auctions.set(id, auction);
    return auction;
  }

  async updateAuction(id: string, update: Partial<InsertAuction>): Promise<Auction | undefined> {
    const auction = this.auctions.get(id);
    if (!auction) return undefined;
    const updated: Auction = { ...auction, ...update };
    this.auctions.set(id, updated);
    return updated;
  }

  async closeAuction(id: string, winnerId: string): Promise<Auction | undefined> {
    const auction = this.auctions.get(id);
    if (!auction) return undefined;
    const updated: Auction = { ...auction, status: 'closed', winnerId };
    this.auctions.set(id, updated);
    return updated;
  }

  // Bids
  async getBid(id: string): Promise<Bid | undefined> {
    return this.bids.get(id);
  }

  async getBidsByAuction(auctionId: string): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(b => b.auctionId === auctionId);
  }

  async getBidsByRetailer(retailerId: string): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(b => b.retailerId === retailerId);
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = randomUUID();
    const bid: Bid = { ...insertBid, id, bidDate: new Date() };
    this.bids.set(id, bid);
    return bid;
  }

  // Reviews
  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.productId === productId);
  }

  async getReviewsByRetailer(retailerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.retailerId === retailerId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { ...insertReview, id, reviewDate: new Date() };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const existing = this.reviews.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.reviews.set(id, updated);
    return updated;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }

  // Campaigns
  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByRetailer(retailerId: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(c => c.retailerId === retailerId);
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(c => c.status === 'active');
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = { ...insertCampaign, id, createdAt: new Date() };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, update: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    const updated: Campaign = { ...campaign, ...update };
    this.campaigns.set(id, updated);
    return updated;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Notifications
  async getNotification(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUser(userId: string, userType: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId && n.userType === userType);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { ...insertNotification, id, createdAt: new Date() };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    const updated: Notification = { ...notification, read: true };
    this.notifications.set(id, updated);
    return updated;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Negotiations
  async getNegotiation(id: string): Promise<Negotiation | undefined> {
    return this.negotiations.get(id);
  }

  async getNegotiationsByCustomer(customerId: string): Promise<Negotiation[]> {
    return Array.from(this.negotiations.values()).filter(n => n.customerId === customerId);
  }

  async getNegotiationsByRetailer(retailerId: string): Promise<Negotiation[]> {
    return Array.from(this.negotiations.values()).filter(n => n.retailerId === retailerId);
  }

  async createNegotiation(insertNegotiation: InsertNegotiation): Promise<Negotiation> {
    const id = randomUUID();
    const negotiation: Negotiation = { ...insertNegotiation, id, createdAt: new Date() };
    this.negotiations.set(id, negotiation);
    return negotiation;
  }

  async updateNegotiation(id: string, update: Partial<InsertNegotiation>): Promise<Negotiation | undefined> {
    const negotiation = this.negotiations.get(id);
    if (!negotiation) return undefined;
    const updated: Negotiation = { ...negotiation, ...update };
    this.negotiations.set(id, updated);
    return updated;
  }

  // Negotiation Messages
  async getNegotiationMessage(id: string): Promise<NegotiationMessage | undefined> {
    return this.negotiationMessages.get(id);
  }

  async getMessagesByNegotiation(negotiationId: string): Promise<NegotiationMessage[]> {
    return Array.from(this.negotiationMessages.values()).filter(m => m.negotiationId === negotiationId);
  }

  async createNegotiationMessage(insertMessage: InsertNegotiationMessage): Promise<NegotiationMessage> {
    const id = randomUUID();
    const message: NegotiationMessage = { ...insertMessage, id, createdAt: new Date() };
    this.negotiationMessages.set(id, message);
    return message;
  }

  // Room Designs
  async getRoomDesign(id: string): Promise<RoomDesign | undefined> {
    return this.roomDesigns.get(id);
  }

  async getRoomDesignsByCustomer(customerId: string): Promise<RoomDesign[]> {
    return Array.from(this.roomDesigns.values()).filter(rd => rd.customerId === customerId);
  }

  async createRoomDesign(insertRoomDesign: InsertRoomDesign): Promise<RoomDesign> {
    const id = randomUUID();
    const roomDesign: RoomDesign = { ...insertRoomDesign, id, createdAt: new Date() };
    this.roomDesigns.set(id, roomDesign);
    return roomDesign;
  }

  async deleteRoomDesign(id: string): Promise<boolean> {
    return this.roomDesigns.delete(id);
  }

  // Cart Items
  async getCartItem(id: string): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async getCartItemsByCustomer(customerId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(ci => ci.customerId === customerId);
  }

  async createCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    const cartItem: CartItem = { ...insertCartItem, id, createdAt: new Date() };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: string, update: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    const updated: CartItem = { ...cartItem, ...update };
    this.cartItems.set(id, updated);
    return updated;
  }

  async deleteCartItem(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(customerId: string): Promise<boolean> {
    const cartItems = Array.from(this.cartItems.values()).filter(ci => ci.customerId === customerId);
    cartItems.forEach(ci => this.cartItems.delete(ci.id));
    return true;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Retailers
  async getRetailer(id: string): Promise<Retailer | undefined> {
    const result = await db.select().from(retailersTable).where(eq(retailersTable.id, id));
    return result[0];
  }

  async getRetailerByEmail(email: string): Promise<Retailer | undefined> {
    const result = await db.select().from(retailersTable).where(eq(retailersTable.email, email));
    return result[0];
  }

  async getAllRetailers(): Promise<Retailer[]> {
    return await db.select().from(retailersTable);
  }

  async createRetailer(retailer: InsertRetailer): Promise<Retailer> {
    const result = await db.insert(retailersTable).values(retailer).returning();
    return result[0];
  }

  async updateRetailer(id: string, retailer: Partial<InsertRetailer>): Promise<Retailer | undefined> {
    const result = await db.update(retailersTable).set(retailer).where(eq(retailersTable.id, id)).returning();
    return result[0];
  }

  async deleteRetailer(id: string): Promise<boolean> {
    await db.delete(retailersTable).where(eq(retailersTable.id, id));
    return true;
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customersTable).where(eq(customersTable.id, id));
    return result[0];
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const result = await db.select().from(customersTable).where(eq(customersTable.email, email));
    return result[0];
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customersTable);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customersTable).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db.update(customersTable).set(customer).where(eq(customersTable.id, id)).returning();
    return result[0];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    await db.delete(customersTable).where(eq(customersTable.id, id));
    return true;
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(productsTable).where(eq(productsTable.id, id));
    return result[0];
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(productsTable);
  }

  async getProductsByRetailer(retailerId: string): Promise<Product[]> {
    return await db.select().from(productsTable).where(eq(productsTable.retailerId, retailerId));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(productsTable).where(eq(productsTable.category, category));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db.select().from(productsTable).where(
      or(
        like(productsTable.name, `%${query}%`),
        like(productsTable.description, `%${query}%`)
      )
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(productsTable).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(productsTable).set(product).where(eq(productsTable.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    await db.delete(productsTable).where(eq(productsTable.id, id));
    return true;
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(ordersTable);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db.select().from(ordersTable).where(eq(ordersTable.customerId, customerId));
  }

  async getOrdersByRetailer(retailerId: string): Promise<Order[]> {
    const orderItemsList = await db.select().from(orderItemsTable).where(eq(orderItemsTable.retailerId, retailerId));
    const orderIds = [...new Set(orderItemsList.map(item => item.orderId))];
    if (orderIds.length === 0) return [];
    const orders = await db.select().from(ordersTable);
    return orders.filter(order => orderIds.includes(order.id));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(ordersTable).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db.update(ordersTable).set(order).where(eq(ordersTable.id, id)).returning();
    return result[0];
  }

  // Order Items
  async getOrderItem(id: string): Promise<OrderItem | undefined> {
    const result = await db.select().from(orderItemsTable).where(eq(orderItemsTable.id, id));
    return result[0];
  }

  async getOrderItemsByOrder(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItemsTable).values(orderItem).returning();
    return result[0];
  }

  async deleteOrderItem(id: string): Promise<boolean> {
    await db.delete(orderItemsTable).where(eq(orderItemsTable.id, id));
    return true;
  }

  // Auctions
  async getAuction(id: string): Promise<Auction | undefined> {
    const result = await db.select().from(auctionsTable).where(eq(auctionsTable.id, id));
    return result[0];
  }

  async getAllAuctions(): Promise<Auction[]> {
    return await db.select().from(auctionsTable);
  }

  async getAuctionsByCustomer(customerId: string): Promise<Auction[]> {
    return await db.select().from(auctionsTable).where(eq(auctionsTable.customerId, customerId));
  }

  async getAuctionsByRetailer(retailerId: string): Promise<Auction[]> {
    return await db.select().from(auctionsTable).where(eq(auctionsTable.retailerId, retailerId));
  }

  async getActiveAuctions(): Promise<Auction[]> {
    return await db.select().from(auctionsTable).where(eq(auctionsTable.status, 'active'));
  }

  async createAuction(auction: InsertAuction): Promise<Auction> {
    const result = await db.insert(auctionsTable).values(auction).returning();
    return result[0];
  }

  async updateAuction(id: string, auction: Partial<InsertAuction>): Promise<Auction | undefined> {
    const result = await db.update(auctionsTable).set(auction).where(eq(auctionsTable.id, id)).returning();
    return result[0];
  }

  async closeAuction(id: string, winnerId: string): Promise<Auction | undefined> {
    const result = await db.update(auctionsTable)
      .set({ status: 'ended', winnerId })
      .where(eq(auctionsTable.id, id))
      .returning();
    return result[0];
  }

  // Bids
  async getBid(id: string): Promise<Bid | undefined> {
    const result = await db.select().from(bidsTable).where(eq(bidsTable.id, id));
    return result[0];
  }

  async getBidsByAuction(auctionId: string): Promise<Bid[]> {
    return await db.select().from(bidsTable).where(eq(bidsTable.auctionId, auctionId));
  }

  async getBidsByRetailer(retailerId: string): Promise<Bid[]> {
    return await db.select().from(bidsTable).where(eq(bidsTable.bidderId, retailerId));
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const result = await db.insert(bidsTable).values(bid).returning();
    return result[0];
  }

  // Reviews
  async getReview(id: string): Promise<Review | undefined> {
    const result = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
    return result[0];
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return await db.select().from(reviewsTable).where(eq(reviewsTable.productId, productId));
  }

  async getReviewsByRetailer(retailerId: string): Promise<Review[]> {
    return await db.select().from(reviewsTable).where(eq(reviewsTable.retailerId, retailerId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviewsTable).values(review).returning();
    return result[0];
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const result = await db.update(reviewsTable)
      .set(updates)
      .where(eq(reviewsTable.id, id))
      .returning();
    return result[0];
  }

  async deleteReview(id: string): Promise<boolean> {
    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    return true;
  }

  // Campaigns
  async getCampaign(id: string): Promise<Campaign | undefined> {
    const result = await db.select().from(campaignsTable).where(eq(campaignsTable.id, id));
    return result[0];
  }

  async getCampaignsByRetailer(retailerId: string): Promise<Campaign[]> {
    return await db.select().from(campaignsTable).where(eq(campaignsTable.retailerId, retailerId));
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaignsTable).where(eq(campaignsTable.status, 'active'));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const result = await db.insert(campaignsTable).values(campaign).returning();
    return result[0];
  }

  async updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const result = await db.update(campaignsTable).set(campaign).where(eq(campaignsTable.id, id)).returning();
    return result[0];
  }

  async deleteCampaign(id: string): Promise<boolean> {
    await db.delete(campaignsTable).where(eq(campaignsTable.id, id));
    return true;
  }

  // Notifications
  async getNotification(id: string): Promise<Notification | undefined> {
    const result = await db.select().from(notificationsTable).where(eq(notificationsTable.id, id));
    return result[0];
  }

  async getNotificationsByUser(userId: string, userType: string): Promise<Notification[]> {
    return await db.select().from(notificationsTable).where(
      and(
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.userType, userType)
      )
    );
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notificationsTable).values(notification).returning();
    return result[0];
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const result = await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id))
      .returning();
    return result[0];
  }

  async deleteNotification(id: string): Promise<boolean> {
    await db.delete(notificationsTable).where(eq(notificationsTable.id, id));
    return true;
  }

  // Negotiations
  async getNegotiation(id: string): Promise<Negotiation | undefined> {
    const result = await db.select().from(negotiationsTable).where(eq(negotiationsTable.id, id));
    return result[0];
  }

  async getNegotiationsByCustomer(customerId: string): Promise<Negotiation[]> {
    return await db.select().from(negotiationsTable).where(eq(negotiationsTable.customerId, customerId));
  }

  async getNegotiationsByRetailer(retailerId: string): Promise<Negotiation[]> {
    return await db.select().from(negotiationsTable).where(eq(negotiationsTable.retailerId, retailerId));
  }

  async createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation> {
    const result = await db.insert(negotiationsTable).values(negotiation).returning();
    return result[0];
  }

  async updateNegotiation(id: string, negotiation: Partial<InsertNegotiation>): Promise<Negotiation | undefined> {
    const result = await db.update(negotiationsTable).set(negotiation).where(eq(negotiationsTable.id, id)).returning();
    return result[0];
  }

  // Negotiation Messages
  async getNegotiationMessage(id: string): Promise<NegotiationMessage | undefined> {
    const result = await db.select().from(negotiationMessagesTable).where(eq(negotiationMessagesTable.id, id));
    return result[0];
  }

  async getMessagesByNegotiation(negotiationId: string): Promise<NegotiationMessage[]> {
    return await db.select().from(negotiationMessagesTable).where(eq(negotiationMessagesTable.negotiationId, negotiationId));
  }

  async createNegotiationMessage(message: InsertNegotiationMessage): Promise<NegotiationMessage> {
    const result = await db.insert(negotiationMessagesTable).values(message).returning();
    return result[0];
  }

  // Room Designs
  async getRoomDesign(id: string): Promise<RoomDesign | undefined> {
    const result = await db.select().from(roomDesignsTable).where(eq(roomDesignsTable.id, id));
    return result[0];
  }

  async getRoomDesignsByCustomer(customerId: string): Promise<RoomDesign[]> {
    return await db.select().from(roomDesignsTable).where(eq(roomDesignsTable.customerId, customerId));
  }

  async createRoomDesign(roomDesign: InsertRoomDesign): Promise<RoomDesign> {
    const result = await db.insert(roomDesignsTable).values(roomDesign).returning();
    return result[0];
  }

  async deleteRoomDesign(id: string): Promise<boolean> {
    await db.delete(roomDesignsTable).where(eq(roomDesignsTable.id, id));
    return true;
  }

  // Cart Items
  async getCartItem(id: string): Promise<CartItem | undefined> {
    const result = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, id));
    return result[0];
  }

  async getCartItemsByCustomer(customerId: string): Promise<any[]> {
    const items = await db
      .select({
        id: cartItemsTable.id,
        customerId: cartItemsTable.customerId,
        productId: cartItemsTable.productId,
        quantity: cartItemsTable.quantity,
        createdAt: cartItemsTable.createdAt,
        product: productsTable,
      })
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.customerId, customerId));
    
    return items;
  }

  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const result = await db.insert(cartItemsTable).values(cartItem).returning();
    return result[0];
  }

  async updateCartItem(id: string, cartItem: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const result = await db.update(cartItemsTable).set(cartItem).where(eq(cartItemsTable.id, id)).returning();
    return result[0];
  }

  async deleteCartItem(id: string): Promise<boolean> {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, id));
    return true;
  }

  async clearCart(customerId: string): Promise<boolean> {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.customerId, customerId));
    return true;
  }
}

export const storage = new DatabaseStorage();
