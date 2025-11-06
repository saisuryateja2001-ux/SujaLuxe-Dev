import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  History, 
  Sparkles, 
  ArrowRight,
  Crown,
  TrendingUp
} from "lucide-react";
import type { Customer, Order, OrderItem, CartItem, Product } from "@shared/schema";

type OrderWithItems = Order & { items: OrderItem[] };
type CartItemWithProduct = CartItem & { product: Product };

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function Dashboard() {
  // Get authenticated customer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  // Fetch customer profile
  const { data: customer, isLoading: customerLoading } = useQuery<Customer>({
    queryKey: ["/api/customers", customerId],
    enabled: !!customerId,
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: [`/api/orders?customerId=${customerId}`],
    enabled: !!customerId,
  });

  // Fetch cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: [`/api/cart?customerId=${customerId}`],
    enabled: !!customerId,
  });

  // Calculate stats
  const activeOrders = orders.filter(o => 
    o.orderStatus !== "delivered" && o.orderStatus !== "cancelled"
  ).length;
  
  const totalOrders = orders.length;
  const cartItemsCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );

  // Get recent orders (last 3)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime())
    .slice(0, 3);

  const firstName = customer?.name.split(" ")[0] || "Customer";

  // Show loading state
  if (customerLoading || ordersLoading || cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Crown className="h-12 w-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-6 w-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold">
              Welcome back, {firstName}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your luxury interior shopping dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-elevate" data-testid="card-active-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-active-orders-count">
                {activeOrders}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeOrders === 1 ? "order" : "orders"} in progress
              </p>
              <Link href="/customer/orders">
                <Button variant="ghost" size="sm" className="mt-3 w-full" data-testid="button-view-orders">
                  View All Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-cart-summary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Shopping Cart</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-cart-items-count">
                {cartItemsCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ₹{cartTotal.toLocaleString("en-IN")} total
              </p>
              <Link href="/customer/cart">
                <Button variant="ghost" size="sm" className="mt-3 w-full" data-testid="button-view-cart">
                  View Cart
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-order-history">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Order History</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-orders-count">
                {totalOrders}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time orders
              </p>
              <Link href="/customer/orders">
                <Button variant="ghost" size="sm" className="mt-3 w-full" data-testid="button-view-history">
                  View History
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8" data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle className="font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/customer/products">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2" data-testid="button-browse-products">
                <Package className="h-6 w-6" />
                <span className="font-medium">Browse Products</span>
                <span className="text-xs text-muted-foreground">Explore our collection</span>
              </Button>
            </Link>
            
            <Link href="/customer/ai-designer">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2" data-testid="button-ai-designer">
                <Sparkles className="h-6 w-6" />
                <span className="font-medium">AI Room Designer</span>
                <span className="text-xs text-muted-foreground">Visualize products</span>
              </Button>
            </Link>

            <Link href="/customer/cart">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2" data-testid="button-cart">
                <ShoppingCart className="h-6 w-6" />
                <span className="font-medium">View Cart</span>
                <span className="text-xs text-muted-foreground">{cartItemsCount} items</span>
              </Button>
            </Link>

            <Link href="/customer/orders">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2" data-testid="button-track-orders">
                <TrendingUp className="h-6 w-6" />
                <span className="font-medium">Track Orders</span>
                <span className="text-xs text-muted-foreground">{activeOrders} active</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <Card data-testid="card-recent-orders">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif">Recent Orders</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your latest orders at a glance
                </p>
              </div>
              <Link href="/customer/orders">
                <Button variant="ghost" size="sm" data-testid="button-see-all-orders">
                  See All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                    data-testid={`card-order-${order.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <Badge className={statusColors[order.orderStatus as keyof typeof statusColors]}>
                          {order.orderStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"} • 
                        ₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt || new Date()).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for No Orders */}
        {recentOrders.length === 0 && (
          <Card className="p-12" data-testid="card-empty-orders">
            <CardContent className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold">Start Your Luxury Journey</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Browse our curated collection of premium interior pieces and create the home of your dreams
              </p>
              <Link href="/customer/products">
                <Button size="lg" className="gap-2" data-testid="button-start-shopping">
                  Browse Collection
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
