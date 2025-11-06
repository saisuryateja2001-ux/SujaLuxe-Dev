import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Package } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

type AnalyticsData = {
  totalSales: number;
  monthlyRevenue: number;
  activeOrders: number;
  pendingShipment: number;
  lowStockCount: number;
  lowStockProducts: { id: string; name: string; stock: number }[];
  revenueTrend: { month: string; revenue: number }[];
  topProducts: { name: string; sales: number }[];
};

export default function Dashboard() {
  // Get authenticated retailer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const retailerId = authData?.user?.id;

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/retailer", retailerId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/retailer/${retailerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!retailerId,
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your SujaLuxe retailer portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-sales">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{analytics.totalSales.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{analytics.monthlyRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-orders">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{analytics.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">{analytics.pendingShipment} pending shipment</p>
          </CardContent>
        </Card>

        <Card data-testid="card-low-stock">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{analytics.lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-revenue-chart">
          <CardHeader>
            <CardTitle className="font-serif">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="card-top-products">
          <CardHeader>
            <CardTitle className="font-serif">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-recent-orders">
        <CardHeader>
          <CardTitle className="font-serif">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md hover-elevate">
                <div className="flex items-center gap-4">
                  <Package className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium">Order #SL-{10240 + i}</p>
                    <p className="text-sm text-muted-foreground">Customer {i}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{(12000 + i * 1000).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
