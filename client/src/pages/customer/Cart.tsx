import { Link, useLocation } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CartItem, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type CartItemWithProduct = CartItem & { product: Product };

export default function Cart() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get authenticated customer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  // Fetch customer profile for delivery address
  const { data: customer } = useQuery({
    queryKey: ["/api/customers", customerId],
    enabled: !!customerId,
  });

  // Fetch cart items with product details (backend joins products)
  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: [`/api/cart?customerId=${customerId}`],
    enabled: !!customerId,
  });

  // Update quantity mutation with optimistic updates
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return res.json();
    },
    onMutate: async ({ id, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`/api/cart?customerId=${customerId}`] });
      
      // Snapshot the previous value
      const previousCart = queryClient.getQueryData([`/api/cart?customerId=${customerId}`]);
      
      // Optimistically update to the new value
      queryClient.setQueryData([`/api/cart?customerId=${customerId}`], (old: CartItemWithProduct[] | undefined) => {
        if (!old) return old;
        return old.map(item => 
          item.id === id ? { ...item, quantity } : item
        );
      });
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData([`/api/cart?customerId=${customerId}`], context.previousCart);
      }
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [`/api/cart?customerId=${customerId}`] });
    },
  });

  // Remove item mutation with optimistic updates
  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/cart/${id}`);
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [`/api/cart?customerId=${customerId}`] });
      
      const previousCart = queryClient.getQueryData([`/api/cart?customerId=${customerId}`]);
      
      queryClient.setQueryData([`/api/cart?customerId=${customerId}`], (old: CartItemWithProduct[] | undefined) => {
        if (!old) return old;
        return old.filter(item => item.id !== id);
      });
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData([`/api/cart?customerId=${customerId}`], context.previousCart);
      }
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart?customerId=${customerId}`] });
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error("Not authenticated");
      if (cartItems.length === 0) throw new Error("Cart is empty");

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
      const shipping = 2000;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + shipping + tax;

      // Create order data from cart
      const deliveryAddress = customer?.address || "No address provided";
      
      const orderData = {
        customerId,
        totalAmount: String(total),
        orderStatus: "pending",
        deliveryAddress,
        paymentStatus: "pending",
      };

      const items = cartItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: String(parseFloat(item.product.price) * item.quantity),
        retailerId: item.product.retailerId,
      }));

      const res = await apiRequest("POST", "/api/orders", {
        order: orderData,
        items,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart?customerId=${customerId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders?customerId=${customerId}`] });
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been confirmed and is being processed.",
      });
      setLocation("/customer/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Failed",
        description: error.message || "Unable to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (id: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: string) => {
    removeItemMutation.mutate(id);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  const shipping = 2000;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-6 flex items-center justify-center">
        <ShoppingBag className="h-8 w-8 text-muted-foreground animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">Shopping Cart</h1>
          <p className="text-muted-foreground">{cartItems.length} items in your cart</p>
        </div>

        {!cartItems || cartItems.length === 0 ? (
          <Card className="p-12" data-testid="card-empty-cart">
            <CardContent className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold">Your cart is empty</h3>
              <p className="text-muted-foreground">Start shopping to add items to your cart</p>
              <Link href="/customer/products">
                <Button className="mt-4">Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} data-testid={`card-cart-item-${item.id}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-serif font-semibold text-lg">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.product.category}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 border rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center" data-testid={`quantity-${item.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              disabled={updateQuantityMutation.isPending}
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xl font-bold text-primary">
                              ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString('en-IN')}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={removeItemMutation.isPending}
                              data-testid={`button-remove-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20" data-testid="card-order-summary">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-xl font-serif font-bold">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">₹{shipping.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (18%)</span>
                      <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending}
                    data-testid="button-checkout"
                  >
                    {checkoutMutation.isPending ? "Processing..." : "Proceed to Checkout"}
                  </Button>
                  <Link href="/customer/products">
                    <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
