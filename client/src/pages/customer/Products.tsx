import { useState } from "react";
import { Link } from "wouter";
import { Search, SlidersHorizontal, Star, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

export default function Products() {
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch products from API
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get authenticated user
  const { data: authData, isLoading: authLoading } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });

  // Track which product is being added to cart
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (authLoading) {
        throw new Error("Authentication in progress, please wait...");
      }
      if (!authData?.user?.id) {
        throw new Error("Please log in to add items to cart");
      }
      setAddingProductId(productId);
      const res = await apiRequest("POST", "/api/cart", {
        customerId: authData.user.id,
        productId,
        quantity: 1,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate cart queries to refresh cart data
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart successfully.",
      });
      setAddingProductId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
      setAddingProductId(null);
    },
  });

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">Luxury Collection</h1>
          <p className="text-muted-foreground">Explore our curated selection of premium interior pieces</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10" data-testid="input-search-products" />
          </div>
          <Select defaultValue="featured">
            <SelectTrigger className="w-full md:w-48" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-filters">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="font-serif">Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label>Price Range</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={200000}
                    step={5000}
                    className="mt-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Category</Label>
                  {["Furniture", "Lighting", "Decor", "Textiles", "Art"].map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox id={cat} />
                      <label htmlFor={cat} className="text-sm cursor-pointer">
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label>Availability</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="in-stock" />
                    <label htmlFor="in-stock" className="text-sm cursor-pointer">
                      In Stock Only
                    </label>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading luxury collection...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center min-h-[400px] flex items-center justify-center">
            <div className="space-y-3">
              <p className="text-destructive">Failed to load products</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center min-h-[400px] flex items-center justify-center">
            <div className="space-y-3">
              <p className="text-muted-foreground text-lg">No products found</p>
              <p className="text-sm text-muted-foreground">Check back soon for new luxury items</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover-elevate" data-testid={`card-product-${product.id}`}>
                  <div className="aspect-square bg-muted relative group">
                    {product.stockQuantity === 0 && (
                      <Badge className="absolute top-3 left-3 bg-muted-foreground">Out of Stock</Badge>
                    )}
                    {product.stockQuantity > 0 && product.stockQuantity < 5 && (
                      <Badge className="absolute top-3 left-3 bg-yellow-500">Low Stock</Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur"
                      data-testid={`button-wishlist-${product.id}`}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-serif font-semibold text-lg line-clamp-1" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                        ₹{parseFloat(product.price).toLocaleString('en-IN')}
                      </p>
                      <Button
                        size="sm"
                        className="gap-2"
                        disabled={product.stockQuantity === 0 || addingProductId === product.id || authLoading}
                        onClick={() => addToCartMutation.mutate(product.id)}
                        data-testid={`button-add-cart-${product.id}`}
                      >
                        {addingProductId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
