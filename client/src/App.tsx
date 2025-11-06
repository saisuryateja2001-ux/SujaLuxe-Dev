import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { CustomerHeader } from "@/components/CustomerHeader";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import CustomerRegister from "@/pages/CustomerRegister";
import RetailerRegister from "@/pages/RetailerRegister";

import RetailerDashboard from "@/pages/retailer/Dashboard";
import RetailerProducts from "@/pages/retailer/Products";
import RetailerOrders from "@/pages/retailer/Orders";
import RetailerAnalytics from "@/pages/retailer/Analytics";
import RetailerProfile from "@/pages/retailer/Profile";
import RetailerReviews from "@/pages/retailer/Reviews";
import RetailerAuctions from "@/pages/retailer/Auctions";
import RetailerCampaigns from "@/pages/retailer/Campaigns";
import RetailerNotifications from "@/pages/retailer/Notifications";

import CustomerHome from "@/pages/customer/Home";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CustomerProducts from "@/pages/customer/Products";
import CustomerAIDesigner from "@/pages/customer/AIDesigner";
import CustomerCart from "@/pages/customer/Cart";
import CustomerWishlist from "@/pages/customer/Wishlist";
import CustomerNegotiate from "@/pages/customer/Negotiate";
import CustomerOrders from "@/pages/customer/Orders";
import CustomerAuctions from "@/pages/customer/Auctions";
import CustomerReviews from "@/pages/customer/Reviews";
import CustomerCampaigns from "@/pages/customer/Campaigns";
import CustomerProfile from "@/pages/customer/Profile";
import CustomerSupport from "@/pages/customer/Support";

function RetailerRouter() {
  return (
    <Switch>
      <Route path="/retailer/dashboard" component={RetailerDashboard} />
      <Route path="/retailer/products" component={RetailerProducts} />
      <Route path="/retailer/orders" component={RetailerOrders} />
      <Route path="/retailer/analytics" component={RetailerAnalytics} />
      <Route path="/retailer/profile" component={RetailerProfile} />
      <Route path="/retailer/reviews" component={RetailerReviews} />
      <Route path="/retailer/auctions" component={RetailerAuctions} />
      <Route path="/retailer/campaigns" component={RetailerCampaigns} />
      <Route path="/retailer/notifications" component={RetailerNotifications} />
      <Route component={NotFound} />
    </Switch>
  );
}

function CustomerRouter() {
  return (
    <Switch>
      <Route path="/customer/dashboard" component={CustomerDashboard} />
      <Route path="/customer/products" component={CustomerProducts} />
      <Route path="/customer/ai-designer" component={CustomerAIDesigner} />
      <Route path="/customer/cart" component={CustomerCart} />
      <Route path="/customer/wishlist" component={CustomerWishlist} />
      <Route path="/customer/negotiate" component={CustomerNegotiate} />
      <Route path="/customer/orders" component={CustomerOrders} />
      <Route path="/customer/auctions" component={CustomerAuctions} />
      <Route path="/customer/reviews" component={CustomerReviews} />
      <Route path="/customer/campaigns" component={CustomerCampaigns} />
      <Route path="/customer/profile" component={CustomerProfile} />
      <Route path="/customer/support" component={CustomerSupport} />
      <Route component={NotFound} />
    </Switch>
  );
}

function RetailerLayout() {
  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <main className="flex-1 overflow-auto p-8 bg-background">
            <RetailerRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function CustomerLayout() {
  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider 
      style={sidebarStyle as React.CSSProperties}
      defaultOpen={false}
    >
      <div className="flex h-screen w-full relative">
        <CustomerSidebar collapsible="offcanvas" />
        <div className="flex flex-col flex-1">
          <main className="flex-1 overflow-auto bg-background">
            <CustomerRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/register/customer" component={CustomerRegister} />
      <Route path="/register/retailer" component={RetailerRegister} />
      <Route path="/retailer/:rest*">
        {() => <RetailerLayout />}
      </Route>
      <Route path="/customer">
        {(params) =>
          params ? null : (
            <div className="min-h-screen bg-background">
              <CustomerHeader />
              <main>
                <CustomerHome />
              </main>
            </div>
          )
        }
      </Route>
      <Route path="/customer/:rest+">
        {() => <CustomerLayout />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
