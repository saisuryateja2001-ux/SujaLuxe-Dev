import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

type Retailer = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  contactNumber: string;
  address: string;
  gstNumber: string | null;
  panNumber: string | null;
  logoUrl: string | null;
  about: string | null;
  workingHours: string | null;
  bankDetails: string | null;
  createdAt: Date | null;
};

type ProfileFormData = {
  businessName: string;
  ownerName: string;
  contactNumber: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  logoUrl: string;
  about: string;
  workingHours: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
};

type BankDetails = {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
};

export default function Profile() {
  const { toast } = useToast();

  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const retailerId = authData?.user?.id;

  const { data: retailer, isLoading } = useQuery<Retailer>({
    queryKey: ["/api/retailers", retailerId],
    enabled: !!retailerId,
    queryFn: async () => {
      const res = await fetch(`/api/retailers/${retailerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch retailer profile");
      return res.json();
    },
  });

  // Parse bank details from JSON
  const parseBankDetails = (bankDetailsJson: string | null): BankDetails => {
    if (!bankDetailsJson) {
      return { bankName: "", accountNumber: "", ifsc: "", branch: "" };
    }
    try {
      return JSON.parse(bankDetailsJson);
    } catch {
      return { bankName: "", accountNumber: "", ifsc: "", branch: "" };
    }
  };

  const bankDetails = retailer ? parseBankDetails(retailer.bankDetails) : null;

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    values: retailer ? {
      businessName: retailer.businessName,
      ownerName: retailer.ownerName,
      contactNumber: retailer.contactNumber,
      address: retailer.address,
      gstNumber: retailer.gstNumber || "",
      panNumber: retailer.panNumber || "",
      logoUrl: retailer.logoUrl || "",
      about: retailer.about || "",
      workingHours: retailer.workingHours || "",
      bankName: bankDetails?.bankName || "",
      accountNumber: bankDetails?.accountNumber || "",
      ifsc: bankDetails?.ifsc || "",
      branch: bankDetails?.branch || "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // Convert bank fields to JSON string
      const { bankName, accountNumber, ifsc, branch, ...otherFields } = data;
      const bankDetailsObj: BankDetails = { bankName, accountNumber, ifsc, branch };
      const bankDetailsJson = JSON.stringify(bankDetailsObj);

      const res = await apiRequest("PUT", `/api/retailers/${retailerId}`, {
        ...otherFields,
        bankDetails: bankDetailsJson,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retailers", retailerId] });
      toast({
        title: "Profile Updated",
        description: "Your business profile has been updated successfully.",
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
      <div className="flex items-center justify-center h-64" data-testid="loading-profile">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!retailer) {
    return (
      <div className="text-center p-8" data-testid="error-not-found">
        <p className="text-muted-foreground">Retailer profile not found</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-4xl font-serif font-bold" data-testid="heading-profile">Business Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your retailer information and settings</p>
      </div>

      <Card data-testid="card-business-info">
        <CardHeader>
          <CardTitle className="font-serif">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                {...register("businessName", { required: "Business name is required" })}
                data-testid="input-business-name"
              />
              {errors.businessName && (
                <p className="text-sm text-destructive">{errors.businessName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                {...register("ownerName", { required: "Owner name is required" })}
                data-testid="input-owner-name"
              />
              {errors.ownerName && (
                <p className="text-sm text-destructive">{errors.ownerName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={retailer.email}
                disabled
                data-testid="input-email"
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                {...register("contactNumber", { required: "Contact number is required" })}
                data-testid="input-contact"
              />
              {errors.contactNumber && (
                <p className="text-sm text-destructive">{errors.contactNumber.message}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                rows={3}
                {...register("address", { required: "Address is required" })}
                data-testid="input-address"
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input id="gst" {...register("gstNumber")} data-testid="input-gst" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number</Label>
              <Input id="pan" {...register("panNumber")} data-testid="input-pan" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-business-details">
        <CardHeader>
          <CardTitle className="font-serif">Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="about">About Business</Label>
            <Textarea
              id="about"
              rows={4}
              {...register("about")}
              placeholder="Tell customers about your business..."
              data-testid="input-about"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Working Hours</Label>
            <Input
              id="hours"
              {...register("workingHours")}
              placeholder="e.g., Mon-Sat: 10:00 AM - 8:00 PM"
              data-testid="input-hours"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              {...register("logoUrl")}
              placeholder="https://example.com/logo.png"
              data-testid="input-logo"
            />
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-bank-details">
        <CardHeader>
          <CardTitle className="font-serif">Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" {...register("bankName")} data-testid="input-bank-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                {...register("accountNumber")}
                data-testid="input-account"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC Code</Label>
              <Input id="ifsc" {...register("ifsc")} data-testid="input-ifsc" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" {...register("branch")} data-testid="input-branch" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          className="gap-2"
          disabled={!isDirty || updateMutation.isPending}
          data-testid="button-save"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
