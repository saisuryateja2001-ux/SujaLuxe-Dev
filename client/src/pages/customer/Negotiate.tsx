import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockNegotiations = [
  {
    id: 1,
    product: "Royal Velvet Sofa",
    retailer: "Elite Interiors",
    price: 45000,
    status: "active",
    lastMessage: "I can offer you 10% discount",
  },
  {
    id: 2,
    product: "Crystal Chandelier",
    retailer: "Luxe Lighting Co.",
    price: 120000,
    status: "active",
    lastMessage: "What's your best offer?",
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "customer",
    message: "Hi, I'm interested in this product. Can we discuss the price?",
    timestamp: "10:30 AM",
    offerPrice: null,
  },
  {
    id: 2,
    sender: "retailer",
    message: "Of course! The listed price is ₹45,000. What did you have in mind?",
    timestamp: "10:32 AM",
    offerPrice: null,
  },
  {
    id: 3,
    sender: "customer",
    message: "Would you consider ₹40,000?",
    timestamp: "10:35 AM",
    offerPrice: 40000,
  },
  {
    id: 4,
    sender: "retailer",
    message: "I can offer you 10% discount, so ₹40,500. That's my best offer.",
    timestamp: "10:40 AM",
    offerPrice: 40500,
  },
];

export default function Negotiate() {
  const [selectedNegotiation, setSelectedNegotiation] = useState(mockNegotiations[0]);
  const [message, setMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");

  const handleSend = () => {
    if (message.trim() || offerPrice) {
      console.log("Sending:", { message, offerPrice });
      setMessage("");
      setOfferPrice("");
    }
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">Negotiations</h1>
          <p className="text-muted-foreground">Chat with retailers to get the best deal</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card data-testid="card-negotiations-list">
              <CardHeader>
                <CardTitle className="font-serif">Active Negotiations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockNegotiations.map((neg) => (
                  <div
                    key={neg.id}
                    className={`p-4 border rounded-md cursor-pointer hover-elevate ${
                      selectedNegotiation.id === neg.id ? "bg-primary/5 border-primary" : ""
                    }`}
                    onClick={() => setSelectedNegotiation(neg)}
                    data-testid={`negotiation-item-${neg.id}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm line-clamp-1">{neg.product}</h4>
                        <Badge className="bg-green-500/10 text-green-700">Active</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{neg.retailer}</p>
                      <p className="text-sm font-bold text-primary">₹{neg.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{neg.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col" data-testid="card-chat">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif">{selectedNegotiation.product}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{selectedNegotiation.retailer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Listed Price</p>
                    <p className="text-xl font-bold text-primary">
                      ₹{selectedNegotiation.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {mockMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.sender === "customer"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        {msg.offerPrice && (
                          <div className="mt-2 pt-2 border-t border-current/20">
                            <p className="text-xs opacity-80">Offer Price</p>
                            <p className="font-bold">₹{msg.offerPrice.toLocaleString()}</p>
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-2">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    data-testid="input-message"
                  />
                  <Button onClick={handleSend} data-testid="button-send">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter offer price..."
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    data-testid="input-offer-price"
                  />
                  <Button variant="outline" onClick={handleSend} data-testid="button-send-offer">
                    Send Offer
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
