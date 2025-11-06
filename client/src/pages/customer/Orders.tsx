import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Truck, CheckCircle, ShoppingBag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import type { Order, OrderItem } from "@shared/schema";
import { format } from "date-fns";

type OrderWithItems = Order & { items: OrderItem[] };

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const getOrderProgress = (status: string) => {
  switch (status) {
    case "pending": return 25;
    case "confirmed": return 50;
    case "shipped": return 75;
    case "delivered": return 100;
    default: return 0;
  }
};

export default function Orders() {
  // Get authenticated customer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  // Fetch customer's orders
  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders", customerId],
    queryFn: async () => {
      const res = await fetch(`/api/orders?customerId=${customerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-6 flex items-center justify-center">
        <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
      </div>
    );
  }
  return (
    <div className="min-h-screen py-8 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12">
            <CardContent className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold">No orders yet</h3>
              <p className="text-muted-foreground">Start shopping to see your orders here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const progress = getOrderProgress(order.orderStatus);
              return (
              <Card key={order.id} data-testid={`card-order-${order.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="font-serif text-2xl">
                        {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">Order ID: {order.id.substring(0, 8)}</p>
                    </div>
                    <Badge className={statusColors[order.orderStatus as keyof typeof statusColors]}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">
                        {order.orderDate ? format(new Date(order.orderDate), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Delivery</p>
                      <p className="font-medium">
                        {order.estimatedDeliveryDate ? format(new Date(order.estimatedDeliveryDate), 'MMM dd, yyyy') : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Shipping Partner</p>
                      <p className="font-medium">{order.shippingPartner || 'TBD'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold text-primary">
                        ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Order Progress</span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Package className="h-4 w-4" />
                        <span>Ordered</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${progress >= 50 ? "text-primary" : "text-muted-foreground"}`}>
                        <CheckCircle className="h-4 w-4" />
                        <span>Confirmed</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${progress >= 75 ? "text-primary" : "text-muted-foreground"}`}>
                        <Truck className="h-4 w-4" />
                        <span>Shipped</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${progress === 100 ? "text-primary" : "text-muted-foreground"}`}>
                        <CheckCircle className="h-4 w-4" />
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  {order.remarks && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Remarks</p>
                      <p className="text-sm text-muted-foreground">{order.remarks}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid={`button-track-${order.id}`}>
                      Track Order
                    </Button>
                    {order.orderStatus === "delivered" && (
                      <Button variant="outline" size="sm" data-testid={`button-review-${order.id}`}>
                        Write Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
