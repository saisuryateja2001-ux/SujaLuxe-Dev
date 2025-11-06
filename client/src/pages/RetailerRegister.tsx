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
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  address: string;
  gstNumber: string;
  panNumber: string;
};

export default function RetailerRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>();
  const password = watch("password");

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormData, "confirmPassword">) => {
      const res = await apiRequest("POST", "/api/auth/retailer/register", data);
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
      setTimeout(() => setLocation("/retailer/dashboard"), 1500);
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
            <CardTitle className="text-3xl font-serif">Register Your Business</CardTitle>
            <p className="text-muted-foreground mt-2">Join SujaLuxe as a luxury retailer</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  {...register("businessName", { required: "Business name is required" })}
                  placeholder="Elite Interiors Pvt Ltd"
                  data-testid="input-business-name"
                />
                {errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  {...register("ownerName", { required: "Owner name is required" })}
                  placeholder="Rajesh Kumar"
                  data-testid="input-owner-name"
                />
                {errors.ownerName && <p className="text-sm text-destructive">{errors.ownerName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Business Email *</Label>
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
                placeholder="contact@eliteinteriors.com"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  {...register("contactNumber", { required: "Contact number is required" })}
                  placeholder="+91 98765 43210"
                  data-testid="input-contact"
                />
                {errors.contactNumber && <p className="text-sm text-destructive">{errors.contactNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  {...register("gstNumber")}
                  placeholder="29ABCDE1234F1Z5"
                  data-testid="input-gst"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  {...register("panNumber")}
                  placeholder="ABCDE1234F"
                  data-testid="input-pan"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address *</Label>
              <Textarea
                id="address"
                {...register("address", { required: "Address is required" })}
                placeholder="123 MG Road, Bangalore, Karnataka 560001"
                rows={3}
                data-testid="input-address"
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
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
                "Register Business"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already registered?{" "}
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
