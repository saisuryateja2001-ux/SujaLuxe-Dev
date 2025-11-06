import { useQuery } from "@tanstack/react-query";
import { Megaphone, Gift, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Campaigns() {
  // Get authenticated customer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-playfair font-bold mb-2">Special Campaigns</h1>
        <p className="text-muted-foreground">Exclusive offers and promotions just for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <Badge className="mb-4">Featured</Badge>
            <h3 className="text-2xl font-playfair font-bold mb-2">Sample Campaign</h3>
            <p className="text-muted-foreground mb-4">Get exclusive discounts on luxury items</p>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4" />
              <span className="font-semibold">Up to 30% OFF</span>
            </div>
          </div>
          <CardContent className="p-6">
            <Button className="w-full" data-testid="button-view-campaign">
              View Campaign
            </Button>
          </CardContent>
        </Card>

        <Card className="flex items-center justify-center min-h-[300px] border-dashed">
          <div className="text-center p-6">
            <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active campaigns</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for exciting offers</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
