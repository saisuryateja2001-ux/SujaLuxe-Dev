import { useQuery } from "@tanstack/react-query";
import { HelpCircle, MessageCircle, Mail, Phone, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Support() {
  // Get authenticated customer
  const { data: authData } = useQuery<{ user: { id: string; userType: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const customerId = authData?.user?.id;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-playfair font-bold mb-2">Support Center</h1>
        <p className="text-muted-foreground">We're here to help you with any questions or concerns</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Help Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-10"
                data-testid="input-search-help"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover-elevate cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our support team</p>
              <Button variant="ghost" size="sm" className="mt-2" data-testid="button-start-chat">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@sujaluxe.com</p>
              <Button variant="ghost" size="sm" className="mt-2" data-testid="button-send-email">Send Email</Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer">
            <CardContent className="p-6 text-center">
              <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground">+91 1800-123-4567</p>
              <Button variant="ghost" size="sm" className="mt-2" data-testid="button-call">Call Us</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I track my order?</AccordionTrigger>
                <AccordionContent>
                  You can track your order by going to "My Orders" section. Each order will show its current status and estimated delivery date.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What is the return policy?</AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day return policy for most items. Products must be in their original condition and packaging. Contact support to initiate a return.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How does the AI Room Designer work?</AccordionTrigger>
                <AccordionContent>
                  The AI Room Designer uses advanced AI to visualize how products will look in your space. Simply upload a photo of your room and select products to see them in context.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards, debit cards, UPI, net banking, and digital wallets for a seamless checkout experience.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
