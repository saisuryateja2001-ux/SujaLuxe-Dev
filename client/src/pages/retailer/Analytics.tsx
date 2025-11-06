import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const categoryData = [
  { name: "Furniture", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Lighting", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Decor", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Textiles", value: 10, color: "hsl(var(--chart-4))" },
];

const monthlyData = [
  { month: "Jan", sales: 42000, orders: 45 },
  { month: "Feb", sales: 48000, orders: 52 },
  { month: "Mar", sales: 45000, orders: 48 },
  { month: "Apr", sales: 58000, orders: 61 },
  { month: "May", sales: 52000, orders: 55 },
  { month: "Jun", sales: 67000, orders: 72 },
];

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold">Sales & Revenue Analytics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive insights into your business performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card data-testid="card-total-sales-metric">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹3,12,000</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+18.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-revenue-metric">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹67,000</div>
            <p className="text-xs text-muted-foreground mt-1">June 2024</p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-order-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹4,333</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+5.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-conversion-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3.24%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-red-600">-0.4%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-orders">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">333</div>
            <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
          </CardContent>
        </Card>

        <Card data-testid="card-returns-refunds">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Returns / Refunds</CardTitle>
            <RefreshCw className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground mt-1">8 orders returned</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-revenue-trend">
          <CardHeader>
            <CardTitle className="font-serif">Revenue & Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
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
                  dataKey="sales"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Sales (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="card-category-performance">
          <CardHeader>
            <CardTitle className="font-serif">Category Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-top-products">
        <CardHeader>
          <CardTitle className="font-serif">Top-Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Royal Velvet Sofa", sales: 145, revenue: "₹65,25,000" },
              { name: "Marble Dining Table", sales: 132, revenue: "₹1,12,20,000" },
              { name: "Crystal Chandelier", sales: 98, revenue: "₹58,80,000" },
              { name: "Luxury Bed Frame", sales: 87, revenue: "₹43,50,000" },
            ].map((product, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                </div>
                <p className="font-bold text-primary">{product.revenue}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
