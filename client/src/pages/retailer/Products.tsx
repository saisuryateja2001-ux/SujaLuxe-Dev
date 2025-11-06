import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
  stockQuantity: z.string().min(1, "Stock is required"),
}).omit({ retailerId: true });

type ProductFormData = z.infer<typeof productFormSchema>;

export default function Products() {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch current user to get retailer ID
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });

  const retailerId = authData?.user?.id;

  // Fetch products for this retailer
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", "retailer", retailerId],
    queryFn: async () => {
      const res = await fetch(`/api/products?retailerId=${retailerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: !!retailerId,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      stockQuantity: "",
      imageUrl: "",
      specifications: "",
      placement: "",
      placementType: "floor",
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        ...data,
        retailerId: retailerId!,
        price: data.price,
        stockQuantity: parseInt(data.stockQuantity),
      };
      const res = await apiRequest("POST", "/api/products", productData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "Your product has been added successfully",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const productData = {
        ...data,
        retailerId: retailerId!,
        price: data.price,
        stockQuantity: parseInt(data.stockQuantity),
      };
      const res = await apiRequest("PUT", `/api/products/${id}`, productData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "Your product has been updated successfully",
      });
      setOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/products/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "Your product has been removed successfully",
      });
      setDeleteProductId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity.toString(),
      imageUrl: product.imageUrl || "",
      specifications: product.specifications || "",
      placement: product.placement || "",
      placementType: product.placementType,
    });
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset();
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold">Product Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage your luxury product collection</p>
        </div>
        <Dialog open={open} onOpenChange={(value) => {
          setOpen(value);
          if (!value) {
            setEditingProduct(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-product" onClick={handleAddNew}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Royal Velvet Sofa" {...field} data-testid="input-product-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="lighting">Lighting</SelectItem>
                          <SelectItem value="decor">Decor</SelectItem>
                          <SelectItem value="textiles">Textiles</SelectItem>
                          <SelectItem value="art">Art</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25000" {...field} data-testid="input-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} data-testid="input-stock" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="placementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placement Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-placement">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="wall">Wall</SelectItem>
                          <SelectItem value="floor">Floor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Elegant handcrafted sofa with premium velvet upholstery..."
                          rows={4}
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-image-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    data-testid="button-submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending 
                      ? "Saving..." 
                      : editingProduct 
                        ? "Update Product" 
                        : "Add Product"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-10" data-testid="input-search-products" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-48" data-testid="select-filter-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
            <SelectItem value="lighting">Lighting</SelectItem>
            <SelectItem value="decor">Decor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
      ) : !products || products.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No products yet</h3>
              <p className="text-muted-foreground">Start building your catalog by adding your first product</p>
            </div>
            <Button onClick={handleAddNew} className="gap-2" data-testid="button-add-first-product">
              <Plus className="h-4 w-4" />
              Add Your First Product
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover-elevate" data-testid={`card-product-${product.id}`}>
              <div className="aspect-square bg-muted relative overflow-hidden">
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
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-primary">
                    ₹{parseFloat(product.price).toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-muted-foreground">Stock: {product.stockQuantity}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2" 
                    onClick={() => handleEdit(product)}
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => setDeleteProductId(product.id)}
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && deleteProductMutation.mutate(deleteProductId)}
              data-testid="button-confirm-delete"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
