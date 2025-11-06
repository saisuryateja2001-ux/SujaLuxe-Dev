import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  User,
  Star,
  Gavel,
  Megaphone,
  Bell,
  Crown
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
} from "@/components/ui/sidebar";
import logoUrl from "@assets/SujaLuxeLogo_1762291935725.png";

const menuItems = [
  { title: "Dashboard", url: "/retailer/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/retailer/products", icon: Package },
  { title: "Orders", url: "/retailer/orders", icon: ShoppingCart },
  { title: "Analytics", url: "/retailer/analytics", icon: TrendingUp },
  { title: "Profile", url: "/retailer/profile", icon: User },
  { title: "Reviews", url: "/retailer/reviews", icon: Star },
  { title: "Auctions", url: "/retailer/auctions", icon: Gavel },
  { title: "Campaigns", url: "/retailer/campaigns", icon: Megaphone },
  { title: "Notifications", url: "/retailer/notifications", icon: Bell },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <Link href="/retailer/dashboard">
          <a className="flex items-center gap-3 hover-elevate rounded-md p-2 -m-2">
            <img src={logoUrl} alt="SujaLuxe" className="h-10 w-auto" />
          </a>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-3">
            Retailer Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive} data-testid={`link-${item.title.toLowerCase()}`}>
                      <Link href={item.url}>
                        <a className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
