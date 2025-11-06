import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Order, OrderItem } from "@shared/schema";

type OrderWithItems = Order & { items: OrderItem[] };

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const paymentColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function Orders() {
  // Get authenticated retailer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const retailerId = authData?.user?.id;

  // Fetch orders for this retailer
  const { data: orders, isLoading, error } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders", "retailer", retailerId],
    queryFn: async () => {
      const res = await fetch(`/api/orders?retailerId=${retailerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!retailerId,
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderStatus: status }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number) => {
    return parseFloat(amount.toString()).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-serif font-bold">Order Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage all customer orders</p>
      </div>

      <Card data-testid="card-orders-table">
        <CardHeader>
          <CardTitle className="font-serif">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load orders. Please try again.</p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No orders yet</h3>
              <p className="text-muted-foreground">Orders from customers will appear here</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        {order.items.length > 0 ? order.items[0].productName : 'N/A'}
                        {order.items.length > 1 && <span className="text-muted-foreground"> +{order.items.length - 1}</span>}
                      </TableCell>
                      <TableCell className="text-right">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                      <TableCell className="text-right font-semibold">₹{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={paymentColors[order.paymentStatus as keyof typeof paymentColors]}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.orderStatus}
                          onValueChange={(value) => handleStatusUpdate(order.id, value)}
                          disabled={updateOrderMutation.isPending}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" data-testid={`button-view-${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {orders && orders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.slice(0, 2).map((order) => (
            <Card key={order.id} data-testid={`card-order-detail-${order.id}`}>
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center justify-between">
                  <span>Order #{order.id.slice(0, 8)}</span>
                  <Badge className={statusColors[order.orderStatus as keyof typeof statusColors]}>
                    {order.orderStatus}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.productName} x {item.quantity}</span>
                      <span className="font-medium">₹{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">{formatDate(order.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-primary">₹{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Status</p>
                    <Badge className={paymentColors[order.paymentStatus as keyof typeof paymentColors]}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Est. Delivery</p>
                    <p className="font-medium">{formatDate(order.estimatedDeliveryDate)}</p>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery Address</p>
                    <p className="text-sm">{order.deliveryAddress}</p>
                  </div>
                  {order.shippingPartner && (
                    <div>
                      <p className="text-xs text-muted-foreground">Shipping Partner</p>
                      <p className="text-sm font-medium">{order.shippingPartner}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
