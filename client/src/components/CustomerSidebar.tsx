import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Heart,
  MessageSquare,
  Gavel,
  Star,
  Megaphone,
  User,
  Sparkles,
  CreditCard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import logoUrl from "@assets/SujaLuxeLogo_1762291935725.png";
import { useToast } from "@/hooks/use-toast";

const mainMenuItems = [
  { title: "Dashboard", url: "/customer/dashboard", icon: LayoutDashboard },
  { title: "Browse Products", url: "/customer/products", icon: Package },
  { title: "AI Room Designer", url: "/customer/ai-designer", icon: Sparkles },
  { title: "Shopping Cart", url: "/customer/cart", icon: ShoppingCart },
  { title: "Wishlist", url: "/customer/wishlist", icon: Heart },
];

const transactionMenuItems = [
  { title: "My Orders", url: "/customer/orders", icon: CreditCard },
  { title: "Negotiations", url: "/customer/negotiate", icon: MessageSquare },
  { title: "Auctions", url: "/customer/auctions", icon: Gavel },
];

const engagementMenuItems = [
  { title: "Reviews", url: "/customer/reviews", icon: Star },
  { title: "Campaigns", url: "/customer/campaigns", icon: Megaphone },
];

const accountMenuItems = [
  { title: "Profile", url: "/customer/profile", icon: User },
  { title: "Support", url: "/customer/support", icon: HelpCircle },
];

export function CustomerSidebar({ collapsible }: { collapsible?: "offcanvas" | "icon" | "none" }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    setLocation("/login");
  };

  return (
    <>
      {/* Floating trigger button on the left edge */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 group">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <SidebarTrigger className="rounded-r-md rounded-l-none bg-sidebar border border-sidebar-border shadow-lg" data-testid="button-sidebar-trigger" />
        </div>
      </div>
      
      <Sidebar collapsible={collapsible}>
        <SidebarHeader className="p-6 border-b border-sidebar-border">
        <Link href="/customer/dashboard" className="flex items-center gap-3 hover-elevate rounded-md p-2 -m-2">
          <img src={logoUrl} alt="SujaLuxe" className="h-10 w-auto" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-3">
            Shopping
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-3">
            Transactions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {transactionMenuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-3">
            Engagement
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {engagementMenuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-3">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountMenuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive} data-testid={`link-${item.title.toLowerCase()}`}>
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
      </Sidebar>
    </>
  );
}
