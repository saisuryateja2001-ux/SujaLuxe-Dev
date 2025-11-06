import { Link } from "wouter";
import { ShoppingCart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoUrl from "@assets/SujaLuxeLogo_1762291935725.png";

export function CustomerHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/customer">
          <a className="flex items-center gap-3 hover-elevate rounded-md p-2 -ml-2" data-testid="link-home">
            <img src={logoUrl} alt="SujaLuxe" className="h-10 w-auto" />
          </a>
        </Link>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search luxury interiors..."
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/customer/cart">
            <Button variant="ghost" size="icon" data-testid="button-cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/customer/profile">
            <Button variant="ghost" size="icon" data-testid="button-profile">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
