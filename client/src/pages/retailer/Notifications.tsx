import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Package,
  Gavel,
  DollarSign,
  Star,
  Megaphone,
  CheckCircle,
} from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "order_received",
    title: "New Order Received",
    message: "Order #SL-10245 from Priya Sharma for Royal Velvet Sofa (₹45,000)",
    time: "5 minutes ago",
    isRead: false,
    icon: ShoppingBag,
  },
  {
    id: 2,
    type: "low_stock",
    title: "Low Stock Alert",
    message: "Crystal Chandelier is running low on stock (3 units remaining)",
    time: "2 hours ago",
    isRead: false,
    icon: Package,
  },
  {
    id: 3,
    type: "auction_ending",
    title: "Auction Ending Soon",
    message: "Auction for Marble Dining Table ends in 4 hours",
    time: "3 hours ago",
    isRead: true,
    icon: Gavel,
  },
  {
    id: 4,
    type: "payment_received",
    title: "Payment Received",
    message: "Payment of ₹85,000 received for Order #SL-10243",
    time: "5 hours ago",
    isRead: true,
    icon: DollarSign,
  },
  {
    id: 5,
    type: "review_posted",
    title: "New Review Posted",
    message: "Anjali Mehta posted a 5-star review on Marble Dining Table",
    time: "1 day ago",
    isRead: true,
    icon: Star,
  },
  {
    id: 6,
    type: "campaign_expiry",
    title: "Campaign Expiring Soon",
    message: "Summer Sale 2024 campaign ends in 3 days",
    time: "2 days ago",
    isRead: true,
    icon: Megaphone,
  },
];

const typeColors = {
  order_received: "bg-green-500/10 text-green-700 dark:text-green-400",
  low_stock: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  auction_ending: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  payment_received: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  review_posted: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  campaign_expiry: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export default function Notifications() {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold">Notifications & Alerts</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" data-testid="button-mark-all-read">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <Card
              key={notification.id}
              className={`hover-elevate ${!notification.isRead ? "border-l-4 border-l-primary" : ""}`}
              data-testid={`card-notification-${notification.id}`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      typeColors[notification.type as keyof typeof typeColors]
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        <p className="text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.isRead && (
                        <Badge className="bg-primary">New</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{notification.time}</p>
                      {!notification.isRead && (
                        <Button variant="ghost" size="sm" data-testid={`button-mark-read-${notification.id}`}>
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
