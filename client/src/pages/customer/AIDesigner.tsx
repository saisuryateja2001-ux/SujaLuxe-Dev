import { useState } from "react";
import { Sparkles, Download, Wand2, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, RoomDesign } from "@shared/schema";

export default function AIDesigner() {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [roomType, setRoomType] = useState("living room");
  const [style, setStyle] = useState("modern");
  const [theme, setTheme] = useState("elegant");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get authenticated customer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch existing room designs for this customer
  const { data: roomDesigns = [], isLoading: designsLoading } = useQuery<RoomDesign[]>({
    queryKey: ["/api/room-designs", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const res = await fetch(`/api/room-designs?customerId=${customerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch room designs");
      return res.json();
    },
    enabled: !!customerId,
  });

  // Generate room design mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!customerId || selectedProductIds.length === 0) {
        throw new Error("Please select at least one product and ensure you're logged in");
      }

      return apiRequest("POST", "/api/room-designs", {
        customerId,
        productIds: selectedProductIds,
        roomType,
        theme,
        style,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/room-designs", customerId] });
      toast({
        title: "Success!",
        description: "AI room design generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate design. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
  
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Design</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">AI Room Designer</h1>
          <p className="text-muted-foreground">Visualize products in your dream space with AI-generated room designs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card data-testid="card-design-settings">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label>Room Type</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger data-testid="select-room-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living room">Living Room</SelectItem>
                      <SelectItem value="bedroom">Bedroom</SelectItem>
                      <SelectItem value="dining room">Dining Room</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="bathroom">Bathroom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger data-testid="select-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="contemporary">Contemporary</SelectItem>
                      <SelectItem value="traditional">Traditional</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger data-testid="select-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="cozy">Cozy</SelectItem>
                      <SelectItem value="sophisticated">Sophisticated</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="minimalistic">Minimalistic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Selected Products ({selectedProducts.length})</Label>
                  {selectedProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No products selected</p>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {selectedProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleProductSelection(product.id)}
                            data-testid={`button-remove-product-${product.id}`}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleGenerate}
                  disabled={selectedProductIds.length === 0 || generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Wand2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Design
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-product-selection">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Available Products</Label>
                  <Badge>{selectedProductIds.length} selected</Badge>
                </div>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No products available</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover-elevate ${
                          selectedProductIds.includes(product.id) ? "bg-primary/5 border-primary" : ""
                        }`}
                        onClick={() => toggleProductSelection(product.id)}
                        data-testid={`product-item-${product.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                          <p className="text-xs font-medium text-primary">₹{parseFloat(product.price).toLocaleString('en-IN')}</p>
                        </div>
                        {selectedProductIds.includes(product.id) && (
                          <Badge className="bg-primary">Selected</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {designsLoading ? (
              <Card className="h-[600px] flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
              </Card>
            ) : roomDesigns.length === 0 ? (
              <Card className="h-[600px] flex items-center justify-center" data-testid="card-empty-canvas">
                <CardContent className="text-center space-y-4 p-12">
                  <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Eye className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold">Visualize Your Dream Space</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select products and room settings, then click "Generate Design" to see AI-powered visualizations
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="text-lg font-semibold">
                  Your Generated Designs ({roomDesigns.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roomDesigns.map((design) => (
                    <Card key={design.id} className="overflow-hidden" data-testid={`card-design-${design.id}`}>
                      <div className="aspect-video bg-muted relative">
                        {design.imageUrl ? (
                          <img
                            src={design.imageUrl}
                            alt={`${design.roomType} design`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-16 w-16 text-primary" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">{design.roomType}</p>
                            <p className="text-sm text-muted-foreground capitalize">{design.style} • {design.theme}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => design.imageUrl && window.open(design.imageUrl, '_blank')}
                            data-testid={`button-download-${design.id}`}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {design.createdAt ? new Date(design.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
