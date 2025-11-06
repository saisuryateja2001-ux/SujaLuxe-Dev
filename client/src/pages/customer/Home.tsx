import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Star, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

type ProductWithRetailer = Product & {
  retailerName?: string;
};

export default function Home() {
  // Fetch all products
  const { data: products = [], isLoading } = useQuery<ProductWithRetailer[]>({
    queryKey: ["/api/products"],
  });

  // Calculate category counts from real products
  const categories = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);

  const categoryList = Object.entries(categories).map(([name, count]) => ({
    name,
    count,
  }));

  // Get featured products (first 4 with highest prices or random selection)
  const featuredProducts = products
    .filter(p => p.stockQuantity > 0)
    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Crown className="h-4 w-4" />
            <span>Luxury, Redefined</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground">
            Elevate Your Living Spaces
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover exquisite interior pieces, visualize with AI, and create the home of your dreams
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Link href="/customer/products">
              <Button size="lg" className="gap-2" data-testid="button-browse-collection">
                Browse Collection
              </Button>
            </Link>
            <Link href="/customer/ai-designer">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-ai-designer">
                <Sparkles className="h-5 w-5" />
                AI Room Designer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-card/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">Shop by Category</h2>
            <p className="text-muted-foreground">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryList.length > 0 ? (
              categoryList.map((category) => (
                <Link key={category.name} href="/customer/products">
                  <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-category-${category.name.toLowerCase()}`}>
                    <CardContent className="p-6 text-center space-y-2">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Crown className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} products</p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No categories available yet
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked luxury pieces for your space</p>
            </div>
            <Link href="/customer/products">
              <Button variant="outline" data-testid="button-view-all">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover-elevate active-elevate-2" data-testid={`card-product-${product.id}`}>
                  <div className="aspect-square bg-muted relative">
                    <Badge className="absolute top-3 right-3 bg-primary">Featured</Badge>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-serif font-semibold text-lg line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.retailerName || 'Retailer'}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">₹{parseFloat(product.price).toLocaleString('en-IN')}</p>
                      <Link href="/customer/products">
                        <Button size="sm" data-testid={`button-view-${product.id}`}>View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-12">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No products available yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Design</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Visualize Before You Buy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use our AI Room Designer to see how products will look in your space. Create stunning visualizations from multiple angles and make confident decisions.
          </p>
          <Link href="/customer/ai-designer">
            <Button size="lg" className="gap-2" data-testid="button-try-ai-designer">
              <Sparkles className="h-5 w-5" />
              Try AI Designer
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
