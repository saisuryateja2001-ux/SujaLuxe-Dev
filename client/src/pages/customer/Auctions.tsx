import { useQuery } from "@tanstack/react-query";
import { Gavel, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Auctions() {
  // Get authenticated customer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-playfair font-bold mb-2">Live Auctions</h1>
        <p className="text-muted-foreground">Bid on exclusive luxury interior items</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square bg-muted relative">
              <Badge className="absolute top-4 right-4" variant="destructive">
                Live
              </Badge>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">Sample Auction Item</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Clock className="h-4 w-4" />
                <span>Ends in 2h 30m</span>
              </div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Current Bid</p>
                <p className="text-2xl font-bold text-primary">₹0.00</p>
              </div>
              <Button className="w-full" data-testid="button-place-bid">
                <Gavel className="h-4 w-4 mr-2" />
                Place Bid
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex items-center justify-center h-96 border-dashed">
          <div className="text-center p-6">
            <Gavel className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active auctions</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for new auction opportunities</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
