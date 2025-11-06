import { useQuery } from "@tanstack/react-query";
import { Star, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Reviews() {
  // Get authenticated customer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-playfair font-bold mb-2">My Reviews</h1>
        <p className="text-muted-foreground">Share your experience with products you've purchased</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="mb-2">Pending Reviews</CardTitle>
                <p className="text-sm text-muted-foreground">Products waiting for your review</p>
              </div>
              <Badge variant="secondary">0 pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No products to review</p>
              <p className="text-sm text-muted-foreground mt-2">Purchase products to leave reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-2">Your product reviews will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
