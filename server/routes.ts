import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcrypt";
import passport from "passport";
import { setupAuth, type AuthUser } from "./auth";
import { generateToken, verifyToken } from "./jwt";
import { storage } from "./storage";
import {
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertAuctionSchema,
  insertBidSchema,
  insertReviewSchema,
  insertCampaignSchema,
  insertNotificationSchema,
  insertNegotiationSchema,
  insertNegotiationMessageSchema,
  insertRoomDesignSchema,
  insertCartItemSchema,
} from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI client (supports both Replit AI Integrations and regular OpenAI API)
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    // Check for Replit AI Integrations first (used in Replit environment)
    if (process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      openai = new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      });
    }
    // Fall back to regular OpenAI API (used for local development)
    else if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    else {
      throw new Error(
        "OpenAI API not configured. Please set either:\n" +
        "- OPENAI_API_KEY for local development, OR\n" +
        "- Replit AI Integrations will be used automatically in Replit"
      );
    }
  }
  return openai;
}

// WebSocket connection tracking
interface WSClient {
  ws: WebSocket;
  userId: string;
  userType: 'retailer' | 'customer';
}

const wsClients: WSClient[] = [];

// JWT Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
  
  req.user = user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup authentication strategies
  setupAuth();
  
  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  
  wss.on("connection", (ws, req) => {
    console.log("WebSocket client connected");
    
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "auth") {
          // Register client with user info
          wsClients.push({
            ws,
            userId: data.userId,
            userType: data.userType,
          });
          ws.send(JSON.stringify({ type: "auth_success" }));
        }
        
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    
    ws.on("close", () => {
      const index = wsClients.findIndex(client => client.ws === ws);
      if (index > -1) {
        wsClients.splice(index, 1);
      }
      console.log("WebSocket client disconnected");
    });
  });

  // Helper function to broadcast to specific users
  function broadcastToUser(userId: string, userType: string, message: any) {
    wsClients
      .filter(client => client.userId === userId && client.userType === userType)
      .forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
        }
      });
  }

  // ============= AUTHENTICATION ROUTES =============
  
  // Retailer login
  app.post("/api/auth/retailer/login", (req, res, next) => {
    passport.authenticate("retailer-login", (err: any, user: AuthUser | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      const token = generateToken(user);
      return res.json({ user, token, message: "Login successful" });
    })(req, res, next);
  });

  // Customer login
  app.post("/api/auth/customer/login", (req, res, next) => {
    passport.authenticate("customer-login", (err: any, user: AuthUser | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      const token = generateToken(user);
      return res.json({ user, token, message: "Login successful" });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = verifyToken(token);
      if (user) {
        return res.json({ user });
      }
    }
    
    // Fallback to session-based auth
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Customer registration
  app.post("/api/auth/customer/register", async (req, res) => {
    try {
      const { name, email, password, contactNumber, address } = req.body;
      
      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }
      
      // Check if email already exists
      const existingCustomer = await storage.getCustomerByEmail(email);
      if (existingCustomer) {
        return res.status(409).json({ error: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create customer
      const customer = await storage.createCustomer({
        name,
        email,
        password: hashedPassword,
        contactNumber: contactNumber || null,
        address: address || null,
      });
      
      // Auto-login after registration
      const authUser: AuthUser = {
        id: customer.id,
        email: customer.email,
        userType: "customer",
      };
      
      const token = generateToken(authUser);
      const { password: _, ...customerData } = customer;
      res.status(201).json({ user: authUser, token, customer: customerData, message: "Registration successful" });
    } catch (error: any) {
      console.error("Customer registration error:", error);
      res.status(500).json({ error: "Registration failed", details: error.message });
    }
  });

  // Retailer registration
  app.post("/api/auth/retailer/register", async (req, res) => {
    try {
      const { businessName, ownerName, email, password, contactNumber, address, gstNumber, panNumber } = req.body;
      
      // Validate required fields
      if (!businessName || !ownerName || !email || !password || !contactNumber || !address) {
        return res.status(400).json({ error: "Business name, owner name, email, password, contact number, and address are required" });
      }
      
      // Check if email already exists
      const existingRetailer = await storage.getRetailerByEmail(email);
      if (existingRetailer) {
        return res.status(409).json({ error: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create retailer
      const retailer = await storage.createRetailer({
        businessName,
        ownerName,
        email,
        password: hashedPassword,
        contactNumber,
        address,
        gstNumber: gstNumber || null,
        panNumber: panNumber || null,
        logoUrl: null,
        about: null,
        workingHours: null,
        bankDetails: null,
      });
      
      // Auto-login after registration
      const authUser: AuthUser = {
        id: retailer.id,
        email: retailer.email,
        userType: "retailer",
      };
      
      const token = generateToken(authUser);
      const { password: _, ...retailerData } = retailer;
      res.status(201).json({ user: authUser, token, retailer: retailerData, message: "Registration successful" });
    } catch (error: any) {
      console.error("Retailer registration error:", error);
      res.status(500).json({ error: "Registration failed", details: error.message });
    }
  });

  // ============= CUSTOMER ROUTES =============

  app.get("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify the customer is accessing their own profile
      if (req.user?.userType !== "customer" || req.user.id !== id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      // Don't send password to client
      const { password, ...customerData } = customer;
      res.json(customerData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.put("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify the customer is updating their own profile
      if (req.user?.userType !== "customer" || req.user.id !== id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Only allow updating name, contactNumber, and address (not email or password)
      const { name, contactNumber, address } = req.body;
      const updates: { name?: string; contactNumber?: string | null; address?: string | null } = {};
      
      if (name !== undefined) updates.name = name;
      if (contactNumber !== undefined) updates.contactNumber = contactNumber || null;
      if (address !== undefined) updates.address = address || null;
      
      // Validate that at least one field is being updated
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }
      
      const customer = await storage.updateCustomer(id, updates);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      // Don't send password to client
      const { password, ...customerData } = customer;
      res.json(customerData);
    } catch (error: any) {
      console.error("Error updating customer:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid customer data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update customer", details: error.message });
    }
  });

  // ============= RETAILER ROUTES =============

  app.get("/api/retailers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify the retailer is accessing their own profile
      if (req.user?.userType !== "retailer" || req.user.id !== id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const retailer = await storage.getRetailer(id);
      if (!retailer) {
        return res.status(404).json({ error: "Retailer not found" });
      }
      
      // Don't send password to client
      const { password, ...retailerData } = retailer;
      res.json(retailerData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch retailer" });
    }
  });

  app.put("/api/retailers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify the retailer is updating their own profile
      if (req.user?.userType !== "retailer" || req.user.id !== id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Only allow updating business fields (not email or password)
      const { businessName, ownerName, contactNumber, address, gstNumber, panNumber, logoUrl, about, workingHours, bankDetails } = req.body;
      const updates: {
        businessName?: string;
        ownerName?: string;
        contactNumber?: string;
        address?: string;
        gstNumber?: string | null;
        panNumber?: string | null;
        logoUrl?: string | null;
        about?: string | null;
        workingHours?: string | null;
        bankDetails?: string | null;
      } = {};
      
      if (businessName !== undefined) updates.businessName = businessName;
      if (ownerName !== undefined) updates.ownerName = ownerName;
      if (contactNumber !== undefined) updates.contactNumber = contactNumber;
      if (address !== undefined) updates.address = address;
      if (gstNumber !== undefined) updates.gstNumber = gstNumber || null;
      if (panNumber !== undefined) updates.panNumber = panNumber || null;
      if (logoUrl !== undefined) updates.logoUrl = logoUrl || null;
      if (about !== undefined) updates.about = about || null;
      if (workingHours !== undefined) updates.workingHours = workingHours || null;
      if (bankDetails !== undefined) updates.bankDetails = bankDetails || null;
      
      // Validate that at least one field is being updated
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }
      
      const retailer = await storage.updateRetailer(id, updates);
      if (!retailer) {
        return res.status(404).json({ error: "Retailer not found" });
      }
      
      // Don't send password to client
      const { password, ...retailerData } = retailer;
      res.json(retailerData);
    } catch (error: any) {
      console.error("Error updating retailer:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid retailer data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update retailer", details: error.message });
    }
  });

  // ============= PRODUCT ROUTES =============
  
  app.get("/api/products", async (req, res) => {
    try {
      const { retailerId, category, search } = req.query;
      
      let products;
      if (retailerId) {
        products = await storage.getProductsByRetailer(retailerId as string);
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ============= ORDER ROUTES =============
  
  app.get("/api/orders", async (req, res) => {
    try {
      const { customerId, retailerId } = req.query;
      
      let orders;
      if (customerId) {
        orders = await storage.getOrdersByCustomer(customerId as string);
      } else if (retailerId) {
        orders = await storage.getOrdersByRetailer(retailerId as string);
      } else {
        orders = await storage.getAllOrders();
      }
      
      // Include order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItemsByOrder(order.id);
          return { ...order, items };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/analytics/retailer/:retailerId", requireAuth, async (req, res) => {
    try {
      const { retailerId } = req.params;
      
      // Check authorization: user must be the retailer they're requesting data for
      if (!req.user || req.user.id !== retailerId || req.user.userType !== 'retailer') {
        return res.status(403).json({ error: "Unauthorized to view this retailer's analytics" });
      }
      
      // Get all orders for this retailer
      const allOrders = await storage.getOrdersByRetailer(retailerId);
      
      // Get all products for this retailer
      const products = await storage.getProductsByRetailer(retailerId);
      
      // Calculate total sales (all orders)
      const totalSales = allOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      
      // Calculate monthly revenue (current month)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyOrders = allOrders.filter(order => 
        order.orderDate && new Date(order.orderDate) >= monthStart
      );
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      
      // Count active orders (not delivered or cancelled)
      const activeOrders = allOrders.filter(order => 
        order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled'
      );
      const pendingShipment = activeOrders.filter(order => 
        order.orderStatus === 'confirmed'
      ).length;
      
      // Low stock products (stock < 10)
      const lowStockProducts = products.filter(p => p.stockQuantity < 10);
      
      // Revenue trend (last 6 months)
      const revenueTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthOrders = allOrders.filter(order => {
          if (!order.orderDate) return false;
          const orderDate = new Date(order.orderDate);
          return orderDate >= monthDate && orderDate < nextMonth;
        });
        const revenue = monthOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
        revenueTrend.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.round(revenue)
        });
      }
      
      // Top selling products (by order item quantity)
      const allOrderItems = await Promise.all(
        allOrders.map(order => storage.getOrderItemsByOrder(order.id))
      );
      const flatItems = allOrderItems.flat();
      const productSales = new Map<string, { name: string; sales: number }>();
      
      flatItems.forEach(item => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.sales += item.quantity;
        } else {
          productSales.set(item.productId, {
            name: item.productName,
            sales: item.quantity
          });
        }
      });
      
      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 4);
      
      res.json({
        totalSales: Math.round(totalSales),
        monthlyRevenue: Math.round(monthlyRevenue),
        activeOrders: activeOrders.length,
        pendingShipment,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.map(p => ({ id: p.id, name: p.name, stock: p.stockQuantity })),
        revenueTrend,
        topProducts
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const items = await storage.getOrderItemsByOrder(order.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order: orderData, items: itemsData } = req.body;
      
      const validatedOrder = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedOrder);
      
      const items = await Promise.all(
        itemsData.map(async (item: any) => {
          const validatedItem = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id,
          });
          return storage.createOrderItem(validatedItem);
        })
      );
      
      // Clear cart if customerId provided
      if (orderData.customerId) {
        await storage.clearCart(orderData.customerId);
      }
      
      // Send notifications to retailers
      for (const item of items) {
        await storage.createNotification({
          userId: item.retailerId,
          userType: "retailer",
          title: "New Order Received",
          message: `New order for ${item.productName}`,
          type: "order",
          isRead: false,
        });
        
        broadcastToUser(item.retailerId, "retailer", {
          type: "new_order",
          order: { ...order, items: [item] },
        });
      }
      
      res.status(201).json({ ...order, items });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Notify customer of status change
      if (req.body.orderStatus) {
        await storage.createNotification({
          userId: order.customerId,
          userType: "customer",
          title: "Order Status Updated",
          message: `Your order status is now: ${req.body.orderStatus}`,
          type: "order",
          isRead: false,
        });
        
        broadcastToUser(order.customerId, "customer", {
          type: "order_update",
          order,
        });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // ============= AUCTION ROUTES =============
  
  app.get("/api/auctions", async (req, res) => {
    try {
      const { customerId, retailerId, active } = req.query;
      
      let auctions;
      if (customerId) {
        auctions = await storage.getAuctionsByCustomer(customerId as string);
      } else if (retailerId) {
        auctions = await storage.getAuctionsByRetailer(retailerId as string);
      } else if (active === 'true') {
        auctions = await storage.getActiveAuctions();
      } else {
        auctions = await storage.getAllAuctions();
      }
      
      // Include bids for each auction
      const auctionsWithBids = await Promise.all(
        auctions.map(async (auction) => {
          const bids = await storage.getBidsByAuction(auction.id);
          return { ...auction, bids };
        })
      );
      
      res.json(auctionsWithBids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch auctions" });
    }
  });

  app.post("/api/auctions", async (req, res) => {
    try {
      const validated = insertAuctionSchema.parse(req.body);
      const auction = await storage.createAuction(validated);
      res.status(201).json(auction);
    } catch (error) {
      res.status(400).json({ error: "Invalid auction data" });
    }
  });

  app.post("/api/auctions/:id/bids", async (req, res) => {
    try {
      const auction = await storage.getAuction(req.params.id);
      if (!auction) {
        return res.status(404).json({ error: "Auction not found" });
      }
      
      if (auction.status !== 'active') {
        return res.status(400).json({ error: "Auction is not active" });
      }
      
      const validated = insertBidSchema.parse({
        ...req.body,
        auctionId: req.params.id,
      });
      
      const bid = await storage.createBid(validated);
      
      // Notify customer of new bid
      await storage.createNotification({
        userId: auction.customerId,
        userType: "customer",
        title: "New Bid on Your Auction",
        message: `A retailer has placed a bid of ₹${bid.bidAmount}`,
        type: "auction",
        isRead: false,
      });
      
      // Broadcast new bid via WebSocket
      broadcastToUser(auction.customerId, "customer", {
        type: "new_bid",
        auctionId: auction.id,
        bid,
      });
      
      res.status(201).json(bid);
    } catch (error) {
      res.status(400).json({ error: "Invalid bid data" });
    }
  });

  app.post("/api/auctions/:id/close", async (req, res) => {
    try {
      const { winnerId } = req.body;
      const auction = await storage.closeAuction(req.params.id, winnerId);
      
      if (!auction) {
        return res.status(404).json({ error: "Auction not found" });
      }
      
      // Notify winner
      await storage.createNotification({
        userId: winnerId,
        userType: "retailer",
        title: "You Won an Auction!",
        message: `Congratulations! You won the auction`,
        type: "auction",
        isRead: false,
      });
      
      broadcastToUser(winnerId, "retailer", {
        type: "auction_won",
        auction,
      });
      
      res.json(auction);
    } catch (error) {
      res.status(500).json({ error: "Failed to close auction" });
    }
  });

  // ============= REVIEW ROUTES =============
  
  app.get("/api/reviews", async (req, res) => {
    try {
      const { productId, retailerId } = req.query;
      
      let reviews: any[] = [];
      if (productId) {
        reviews = await storage.getReviewsByProduct(productId as string);
      } else if (retailerId) {
        reviews = await storage.getReviewsByRetailer(retailerId as string);
      }
      
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validated = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validated);
      
      // Notify retailer of new review
      await storage.createNotification({
        userId: validated.retailerId,
        userType: "retailer",
        title: "New Review Received",
        message: `${validated.rating} star review for your product`,
        type: "review",
        isRead: false,
      });
      
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: "Invalid review data" });
    }
  });

  app.put("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { response, status } = req.body;
      
      // Validate input
      if (!response && !status) {
        return res.status(400).json({ error: "Response or status required" });
      }
      
      // Get the review to verify ownership
      const existingReview = await storage.getReview(id);
      if (!existingReview) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      // Verify the retailer owns this review
      if (req.user?.userType !== "retailer" || existingReview.retailerId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Only allow updating response and status fields
      const updates: { response?: string; status?: string } = {};
      if (response) updates.response = response;
      if (status) updates.status = status;
      
      const review = await storage.updateReview(id, updates);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: "Failed to update review" });
    }
  });

  // ============= CAMPAIGN ROUTES =============
  
  app.get("/api/campaigns", async (req, res) => {
    try {
      const { retailerId, active } = req.query;
      
      let campaigns: any[] = [];
      if (retailerId) {
        campaigns = await storage.getCampaignsByRetailer(retailerId as string);
      } else if (active === 'true') {
        campaigns = await storage.getActiveCampaigns();
      }
      
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validated = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validated);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ error: "Invalid campaign data" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  // ============= NOTIFICATION ROUTES =============
  
  app.get("/api/notifications", async (req, res) => {
    try {
      const { userId, userType } = req.query;
      
      if (!userId || !userType) {
        return res.status(400).json({ error: "userId and userType required" });
      }
      
      const notifications = await storage.getNotificationsByUser(
        userId as string,
        userType as string
      );
      
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // ============= NEGOTIATION ROUTES =============
  
  app.get("/api/negotiations", async (req, res) => {
    try {
      const { customerId, retailerId } = req.query;
      
      let negotiations: any[] = [];
      if (customerId) {
        negotiations = await storage.getNegotiationsByCustomer(customerId as string);
      } else if (retailerId) {
        negotiations = await storage.getNegotiationsByRetailer(retailerId as string);
      }
      
      res.json(negotiations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch negotiations" });
    }
  });

  app.post("/api/negotiations", async (req, res) => {
    try {
      const validated = insertNegotiationSchema.parse(req.body);
      const negotiation = await storage.createNegotiation(validated);
      
      // Notify retailer
      await storage.createNotification({
        userId: validated.retailerId,
        userType: "retailer",
        title: "New Negotiation Request",
        message: `Customer interested in negotiating`,
        type: "negotiation",
        isRead: false,
      });
      
      res.status(201).json(negotiation);
    } catch (error) {
      res.status(400).json({ error: "Invalid negotiation data" });
    }
  });

  app.get("/api/negotiations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByNegotiation(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/negotiations/:id/messages", async (req, res) => {
    try {
      const negotiation = await storage.getNegotiation(req.params.id);
      if (!negotiation) {
        return res.status(404).json({ error: "Negotiation not found" });
      }
      
      const validated = insertNegotiationMessageSchema.parse({
        ...req.body,
        negotiationId: req.params.id,
      });
      
      const message = await storage.createNegotiationMessage(validated);
      
      // Update negotiation status if offer price provided
      if (req.body.offerPrice) {
        await storage.updateNegotiation(req.params.id, {
          status: 'pending',
        });
      }
      
      // Broadcast message via WebSocket to both parties
      const recipientId = validated.senderType === 'customer' 
        ? negotiation.retailerId 
        : negotiation.customerId;
      const recipientType = validated.senderType === 'customer' ? 'retailer' : 'customer';
      
      broadcastToUser(recipientId, recipientType, {
        type: "new_message",
        negotiationId: req.params.id,
        message,
      });
      
      // Create notification
      await storage.createNotification({
        userId: recipientId,
        userType: recipientType,
        title: "New Message",
        message: `New message in negotiation`,
        type: "negotiation",
        isRead: false,
      });
      
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.put("/api/negotiations/:id", async (req, res) => {
    try {
      const negotiation = await storage.updateNegotiation(req.params.id, req.body);
      if (!negotiation) {
        return res.status(404).json({ error: "Negotiation not found" });
      }
      
      // Notify both parties of status change
      if (req.body.status === 'accepted' || req.body.status === 'rejected') {
        const notifyUser = req.body.status === 'accepted' 
          ? negotiation.customerId 
          : negotiation.customerId;
        const notifyType = 'customer';
        
        await storage.createNotification({
          userId: notifyUser,
          userType: notifyType,
          title: `Negotiation ${req.body.status}`,
          message: `Your negotiation was ${req.body.status}`,
          type: "negotiation",
          isRead: false,
        });
      }
      
      res.json(negotiation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update negotiation" });
    }
  });

  // ============= AI ROOM DESIGN ROUTES =============
  
  app.post("/api/room-designs", async (req, res) => {
    try {
      const { customerId, productIds, roomType, theme, style } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: "At least one product ID is required" });
      }
      
      // Get product names for better prompt
      const products = await Promise.all(
        productIds.map((id: string) => storage.getProduct(id))
      );
      const productNames = products.filter(Boolean).map(p => p!.name).join(", ");
      
      // Generate AI image (supports both Replit AI and regular OpenAI)
      const prompt = `A luxurious ${roomType} interior design in ${style} style with ${theme} theme, featuring ${productNames}, high-end furniture and elegant decor, photorealistic, professional interior photography`;
      
      try {
        const aiClient = getOpenAI();
        const isReplitAI = !!(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
        
        // Use appropriate model based on environment
        const response = await aiClient.images.generate({
          model: isReplitAI ? "gpt-image-1" : "dall-e-3",
          prompt,
          size: "1024x1024",
          ...(isReplitAI ? {} : { quality: "hd" as const }),
        });
        
        // Handle different response formats
        let imageUrl: string;
        if (isReplitAI) {
          // Replit AI returns base64 encoded image
          const base64Image = response.data?.[0]?.b64_json || "";
          imageUrl = base64Image ? `data:image/png;base64,${base64Image}` : "";
        } else {
          // Regular OpenAI returns URL (for local dev, convert to base64 for consistency)
          imageUrl = response.data?.[0]?.url || "";
        }
        
        // Create a design entry for each product (they'll all share the same image)
        const designs = await Promise.all(
          productIds.map((productId: string) => {
            const validated = insertRoomDesignSchema.parse({
              customerId,
              productId,
              roomType,
              theme,
              style,
              imageUrl,
              placementType: 'floor',
            });
            return storage.createRoomDesign(validated);
          })
        );
        
        res.status(201).json(designs[0]);
      } catch (aiError: any) {
        console.error("OpenAI error:", aiError);
        
        if (aiError.status === 401 || aiError.message?.includes("Incorrect API key")) {
          return res.status(500).json({ 
            error: "AI service configuration error. Please contact support.",
            details: "Invalid API key"
          });
        }
        
        res.status(500).json({ 
          error: "Failed to generate AI design. Please try again.",
          details: aiError.message 
        });
      }
    } catch (error) {
      console.error("Room design error:", error);
      res.status(400).json({ error: "Invalid room design data" });
    }
  });

  app.get("/api/room-designs", async (req, res) => {
    try {
      const { customerId } = req.query;
      
      if (!customerId) {
        return res.status(400).json({ error: "customerId required" });
      }
      
      const designs = await storage.getRoomDesignsByCustomer(customerId as string);
      res.json(designs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room designs" });
    }
  });

  // ============= CART ROUTES =============
  
  app.get("/api/cart", async (req, res) => {
    try {
      const { customerId } = req.query;
      
      if (!customerId) {
        return res.status(400).json({ error: "customerId required" });
      }
      
      const cartItems = await storage.getCartItemsByCustomer(customerId as string);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validated = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.createCartItem(validated);
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const cartItem = await storage.updateCartItem(req.params.id, req.body);
      if (!cartItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCartItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const { customerId } = req.query;
      
      if (!customerId) {
        return res.status(400).json({ error: "customerId required" });
      }
      
      await storage.clearCart(customerId as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  return httpServer;
}
