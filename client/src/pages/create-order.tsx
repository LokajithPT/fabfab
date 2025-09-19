import { useState } from "react";
import { PlusCircle, User, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@shared/schema";

// Auth fetch helper
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw await res.json();
  return res.json();
};

export default function CreateOrder() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [customerEmail, setCustomerEmail] = useState(""); 
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    queryFn: () => authFetch("/api/services"),
  });

  const selectedServiceDetails = services?.find(s => s.id === selectedService);

  const handleCreateOrder = async () => {
    if (!customerName || !customerPhone || !selectedService) {
      toast({ title: "Validation Error", description: "Fill all required fields", variant: "destructive" });
      return;
    }

    // Payload matches the new backend
    const payload = {
      customerName,
      customerEmail,
      customerPhone,
      serviceId: selectedService,
      pickupDate,
      specialInstructions,
      total: selectedServiceDetails ? parseFloat(selectedServiceDetails.price) : 0,
    };

    try {
      const newOrder = await authFetch("/api/orders", { method: "POST", body: JSON.stringify(payload) });
      setCreatedOrderId(newOrder.id);
      setIsModalOpen(true);
      queryClient.invalidateQueries(["/api/orders"]);

      // reset form
      setCustomerName("");
      setCustomerPhone("");
      setSelectedService("");
      setPickupDate("");
      setSpecialInstructions("");
    } catch (err: any) {
      toast({ title: "Error", description: err.error || "Failed to create order", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-fade-in">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create New Order</h1>
        <Button onClick={handleCreateOrder}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Save Order
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center"><User className="h-5 w-5 mr-2"/>Customer Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Name</Label>
              <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full name"/>
	      <Label>Email</Label>
	      <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="Email address"/>
              <Label>Phone</Label>
              <Input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone number"/>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><Truck className="h-5 w-5 mr-2"/>Service & Scheduling</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Service</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service"/>
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem>
                  : services?.map(s => <SelectItem key={s.id} value={s.id}>{s.name} - ₹{s.price}</SelectItem>)}
                </SelectContent>
              </Select>

              <Label>Pickup Date</Label>
              <Input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}/>
              
              <Label>Instructions</Label>
              <Textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} placeholder="Notes or special instructions"/>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><span>Service</span><span>{selectedServiceDetails?.name || "N/A"}</span></div>
              <div className="flex justify-between"><span>Price</span><span>₹{selectedServiceDetails ? parseFloat(selectedServiceDetails.price).toFixed(2) : "0.00"}</span></div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg"><span>Total</span><span>₹{selectedServiceDetails ? parseFloat(selectedServiceDetails.price).toFixed(2) : "0.00"}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Order Created!</DialogTitle></DialogHeader>
          <div className="py-4">
            <p>Order ID: {createdOrderId}</p>
            <Button onClick={() => setIsModalOpen(false)} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

