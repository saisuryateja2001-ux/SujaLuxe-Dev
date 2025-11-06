import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

type Review = {
  id: string;
  customerId: string;
  customerName: string;
  retailerId: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string | null;
  response: string | null;
  status: string;
  reviewDate: Date | null;
};

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  approved: "bg-green-500/10 text-green-700 dark:text-green-400",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function Reviews() {
  const { toast } = useToast();
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const retailerId = authData?.user?.id;

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews", retailerId],
    enabled: !!retailerId,
    queryFn: async () => {
      const res = await fetch(`/api/reviews?retailerId=${retailerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const res = await apiRequest("PUT", `/api/reviews/${reviewId}`, {
        response,
        status: "approved"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", retailerId] });
      toast({
        title: "Response Submitted",
        description: "Your response has been posted successfully.",
      });
      setOpenDialogId(null);
      setResponses({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResponseChange = (reviewId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleSubmitResponse = (reviewId: string) => {
    const response = responses[reviewId]?.trim();
    if (!response) {
      toast({
        title: "Error",
        description: "Please enter a response before submitting.",
        variant: "destructive",
      });
      return;
    }
    respondMutation.mutate({ reviewId, response });
  };

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold">Customer Reviews</h1>
          <p className="text-muted-foreground mt-1">Manage and respond to customer feedback</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="text-2xl font-bold" data-testid="text-average-rating">{averageRating}</span>
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
        </div>
      </div>

      {!reviews || reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">Customer reviews will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} data-testid={`card-review-${review.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-serif text-xl">{review.customerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{review.productName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[review.status as keyof typeof statusColors]}>
                      {review.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Review:</p>
                  <p className="text-foreground">{review.comment || "No comment provided"}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{review.reviewDate ? new Date(review.reviewDate).toLocaleDateString() : "N/A"}</span>
                </div>
                {review.response ? (
                  <div className="bg-muted/50 p-4 rounded-md border-l-4 border-primary">
                    <p className="text-sm font-medium mb-1">Your Response:</p>
                    <p className="text-sm text-foreground">{review.response}</p>
                  </div>
                ) : (
                  <Dialog open={openDialogId === review.id} onOpenChange={(open) => setOpenDialogId(open ? review.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2" data-testid={`button-respond-${review.id}`}>
                        <MessageSquare className="h-4 w-4" />
                        Respond to Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-serif">Respond to Review</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Customer Review:</p>
                          <p className="text-sm bg-muted p-3 rounded-md">{review.comment || "No comment provided"}</p>
                        </div>
                        <div>
                          <Textarea
                            placeholder="Type your response..."
                            rows={4}
                            value={responses[review.id] || ""}
                            onChange={(e) => handleResponseChange(review.id, e.target.value)}
                            data-testid="input-response"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            onClick={() => handleSubmitResponse(review.id)}
                            disabled={respondMutation.isPending}
                            data-testid="button-submit-response"
                          >
                            {respondMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Response"
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
