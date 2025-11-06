import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Loader2 } from "lucide-react";
import logoUrl from "@assets/SujaLuxeLogo_1762291935725.png";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  address: string;
};

export default function CustomerRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>();
  const password = watch("password");

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormData, "confirmPassword">) => {
      const res = await apiRequest("POST", "/api/auth/customer/register", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      toast({
        title: "Registration Successful",
        description: "Welcome to SujaLuxe! Redirecting to dashboard...",
      });
      setTimeout(() => setLocation("/customer/dashboard"), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="absolute left-6 top-6 gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
          <div className="flex justify-center">
            <img src={logoUrl} alt="SujaLuxe" className="h-16 w-auto" />
          </div>
          <div>
            <CardTitle className="text-3xl font-serif">Create Customer Account</CardTitle>
            <p className="text-muted-foreground mt-2">Join SujaLuxe and discover luxury</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Priya Malhotra"
                data-testid="input-name"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder="priya@example.com"
                data-testid="input-email"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  placeholder="••••••••"
                  data-testid="input-password"
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: value => value === password || "Passwords do not match"
                  })}
                  placeholder="••••••••"
                  data-testid="input-confirm-password"
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                {...register("contactNumber")}
                placeholder="+91 98765 43210"
                data-testid="input-contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="45 MG Road, Bangalore, Karnataka 560001"
                rows={3}
                data-testid="input-address"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
              data-testid="button-register"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/">
                <Button variant="link" className="p-0 h-auto" data-testid="link-login">
                  Sign In
                </Button>
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
