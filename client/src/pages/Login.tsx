import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoUrl from "@assets/SujaLuxeLogo_1762291935725.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [userType, setUserType] = useState<"retailer" | "customer">("customer");
  const { toast } = useToast();

  // Retailer login mutation
  const retailerLoginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/retailer/login", credentials);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      toast({
        title: "Login successful",
        description: "Welcome back to your dashboard",
      });
      setLocation("/retailer/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  // Customer login mutation
  const customerLoginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/customer/login", credentials);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      toast({
        title: "Login successful",
        description: "Welcome to SujaLuxe",
      });
      setLocation("/customer/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>, type: "retailer" | "customer") => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (type === "retailer") {
      retailerLoginMutation.mutate({ email, password });
    } else {
      customerLoginMutation.mutate({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoUrl} alt="SujaLuxe" className="h-16 w-auto" />
          </div>
          <div>
            <CardTitle className="text-3xl font-serif">Welcome to SujaLuxe</CardTitle>
            <p className="text-muted-foreground mt-2">Luxury, Redefined</p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={userType} onValueChange={(v) => setUserType(v as "retailer" | "customer")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="customer" data-testid="tab-customer">Customer</TabsTrigger>
              <TabsTrigger value="retailer" data-testid="tab-retailer">Retailer</TabsTrigger>
            </TabsList>

            <TabsContent value="customer">
              <form onSubmit={(e) => handleLogin(e, "customer")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    name="email"
                    type="email"
                    placeholder="priya.malhotra@example.com"
                    required
                    data-testid="input-customer-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-password">Password</Label>
                  <Input
                    id="customer-password"
                    name="password"
                    type="password"
                    placeholder="customer123"
                    required
                    data-testid="input-customer-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  data-testid="button-customer-login"
                  disabled={customerLoginMutation.isPending}
                >
                  {customerLoginMutation.isPending ? "Signing in..." : "Sign In as Customer"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register/customer">
                    <Button variant="link" className="p-0 h-auto" data-testid="button-customer-register">
                      Register
                    </Button>
                  </Link>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="retailer">
              <form onSubmit={(e) => handleLogin(e, "retailer")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="retailer-email">Business Email</Label>
                  <Input
                    id="retailer-email"
                    name="email"
                    type="email"
                    placeholder="contact@luxeinteriors.com"
                    required
                    data-testid="input-retailer-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retailer-password">Password</Label>
                  <Input
                    id="retailer-password"
                    name="password"
                    type="password"
                    placeholder="retailer123"
                    required
                    data-testid="input-retailer-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  data-testid="button-retailer-login"
                  disabled={retailerLoginMutation.isPending}
                >
                  {retailerLoginMutation.isPending ? "Signing in..." : "Sign In as Retailer"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  New retailer?{" "}
                  <Link href="/register/retailer">
                    <Button variant="link" className="p-0 h-auto" data-testid="button-retailer-register">
                      Apply Now
                    </Button>
                  </Link>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
