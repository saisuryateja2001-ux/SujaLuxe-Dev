import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Gavel, Users, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

const auctions = [
  {
    id: "AUC-001",
    product: "Royal Velvet Sofa",
    startPrice: 40000,
    currentBid: 48000,
    bidders: 12,
    startDate: "2024-06-20",
    endDate: "2024-06-27",
    status: "active",
    winner: null,
  },
  {
    id: "AUC-002",
    product: "Crystal Chandelier",
    startPrice: 100000,
    currentBid: 115000,
    bidders: 8,
    startDate: "2024-06-18",
    endDate: "2024-06-25",
    status: "active",
    winner: null,
  },
  {
    id: "AUC-003",
    product: "Marble Dining Table",
    startPrice: 75000,
    currentBid: 82000,
    bidders: 15,
    startDate: "2024-06-10",
    endDate: "2024-06-17",
    status: "ended",
    winner: "Priya Sharma",
  },
];

const statusColors = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  ended: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function Auctions() {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      productId: "",
      startPrice: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
    setOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold">Auction Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage product auctions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-auction">
              <Plus className="h-4 w-4" />
              Create Auction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Create New Auction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Royal Velvet Sofa</SelectItem>
                          <SelectItem value="2">Crystal Chandelier</SelectItem>
                          <SelectItem value="3">Marble Dining Table</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="40000" {...field} data-testid="input-start-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-start-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-end-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="button-submit">Create Auction</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-active-auctions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Auctions</CardTitle>
            <Gavel className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-bidders">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bidders</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">20</div>
            <p className="text-xs text-muted-foreground mt-1">Across all auctions</p>
          </CardContent>
        </Card>

        <Card data-testid="card-highest-bid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Bid</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹1,15,000</div>
            <p className="text-xs text-muted-foreground mt-1">Crystal Chandelier</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {auctions.map((auction) => (
          <Card key={auction.id} data-testid={`card-auction-${auction.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="font-serif text-xl">{auction.product}</CardTitle>
                    <Badge className={statusColors[auction.status as keyof typeof statusColors]}>
                      {auction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Auction ID: {auction.id}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Price</p>
                  <p className="font-semibold">₹{auction.startPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="font-bold text-primary">₹{auction.currentBid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bidders</p>
                  <p className="font-semibold">{auction.bidders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-semibold">{auction.endDate}</p>
                </div>
              </div>
              {auction.winner && (
                <div className="bg-green-500/10 p-4 rounded-md border border-green-500/20">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Winner: {auction.winner}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
