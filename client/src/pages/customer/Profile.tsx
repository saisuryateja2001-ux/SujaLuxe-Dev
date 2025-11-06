import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Save, User as UserIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

type Customer = {
  id: string;
  name: string;
  email: string;
  contactNumber: string | null;
  address: string | null;
  createdAt: Date | null;
};

type ProfileFormData = {
  name: string;
  contactNumber: string;
  address: string;
};

export default function Profile() {
  const { toast } = useToast();

  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ["/api/customers", customerId],
    enabled: !!customerId,
  });

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    values: customer ? {
      name: customer.name,
      contactNumber: customer.contactNumber || "",
      address: customer.address || "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await apiRequest("PUT", `/api/customers/${customerId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customerId] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Customer profile not found</p>
      </div>
    );
  }

  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card data-testid="card-profile-picture">
            <CardHeader>
              <CardTitle className="font-serif">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials || <UserIcon className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-sm font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-personal-info">
            <CardHeader>
              <CardTitle className="font-serif">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Name is required" })}
                    data-testid="input-name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customer.email}
                    disabled
                    data-testid="input-email"
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    {...register("contactNumber")}
                    placeholder="+91 98765 43210"
                    data-testid="input-contact"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-address">
            <CardHeader>
              <CardTitle className="font-serif">Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  rows={4}
                  {...register("address")}
                  placeholder="Enter your complete delivery address"
                  data-testid="input-address"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || updateMutation.isPending}
              onClick={() => window.location.reload()}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-2"
              disabled={!isDirty || updateMutation.isPending}
              data-testid="button-save"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
