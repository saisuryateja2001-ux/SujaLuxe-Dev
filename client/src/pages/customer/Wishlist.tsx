import { useQuery } from "@tanstack/react-query";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  // Get authenticated customer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-playfair font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">Save your favorite luxury items for later</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square bg-muted"></div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">Sample Wishlist Item</h3>
              <p className="text-sm text-muted-foreground mb-2">Category</p>
              <p className="text-lg font-bold text-primary mb-4">₹0.00</p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" data-testid="button-add-to-cart">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button size="sm" variant="outline" data-testid="button-remove">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex items-center justify-center h-64 border-dashed">
          <div className="text-center p-6">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground mt-2">Browse products to add items to your wishlist</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
