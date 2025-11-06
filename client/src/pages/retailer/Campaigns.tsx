import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Megaphone, Eye } from "lucide-react";
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

const campaigns = [
  {
    id: "CAMP-001",
    name: "Summer Sale 2024",
    discount: 25,
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    products: 45,
    status: "active",
    visibility: "public",
  },
  {
    id: "CAMP-002",
    name: "Exclusive VIP Offer",
    discount: 30,
    startDate: "2024-06-15",
    endDate: "2024-06-22",
    products: 12,
    status: "active",
    visibility: "private",
  },
  {
    id: "CAMP-003",
    name: "Spring Collection Launch",
    discount: 15,
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    products: 67,
    status: "ended",
    visibility: "public",
  },
];

const statusColors = {
  draft: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  ended: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export default function Campaigns() {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      name: "",
      discount: "",
      startDate: "",
      endDate: "",
      visibility: "public",
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
          <h1 className="text-4xl font-serif font-bold">Marketing & Promotions</h1>
          <p className="text-muted-foreground mt-1">Create and manage marketing campaigns</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-campaign">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Create New Campaign</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Sale 2024" {...field} data-testid="input-campaign-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="25" {...field} data-testid="input-discount" />
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
                          <Input type="date" {...field} data-testid="input-campaign-start" />
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
                          <Input type="date" {...field} data-testid="input-campaign-end" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-visibility">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="button-submit">Create Campaign</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-active-campaigns">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card data-testid="card-products-promoted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products Promoted</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">57</div>
            <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-discount">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Discount</CardTitle>
            <Megaphone className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">23.3%</div>
            <p className="text-xs text-muted-foreground mt-1">Current campaigns</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="font-serif text-xl">{campaign.name}</CardTitle>
                    <Badge className={statusColors[campaign.status as keyof typeof statusColors]}>
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline">{campaign.visibility}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Campaign ID: {campaign.id}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Discount</p>
                  <p className="text-2xl font-bold text-primary">{campaign.discount}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-semibold">{campaign.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-semibold">{campaign.endDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products Included</p>
                  <p className="font-semibold">{campaign.products}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" data-testid={`button-edit-${campaign.id}`}>Edit</Button>
                {campaign.status === "active" && (
                  <Button variant="outline" size="sm" data-testid={`button-pause-${campaign.id}`}>Pause</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
