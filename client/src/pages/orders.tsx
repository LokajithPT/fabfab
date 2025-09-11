import { useState, useEffect } from "react";
import { Eye, Edit, X, ArrowUp, ArrowDown, PlusCircle, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLocation } from "wouter";

// This new helper function is for admin endpoints that rely on the session cookie
const adminFetch = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
};

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  serviceId: string;
  specialInstructions: string;
  pickupDate: string;
  total: number;
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [sortField, setSortField] = useState<keyof Order | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Delete modal state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit modal state
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      // Correctly use the admin API endpoint
      const data: Order[] = await adminFetch("/admin/api/orders");
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: (err as Error).message });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let tempOrders = [...orders];
    if (searchQuery) {
      tempOrders = tempOrders.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.service.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortField) {
      tempOrders.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "string" && typeof bVal === "string") return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === "number" && typeof bVal === "number") return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        return 0;
      });
    }
    setFilteredOrders(tempOrders);
  }, [orders, searchQuery, sortField, sortDirection]);

  const handleSort = (field: keyof Order) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRefresh = async () => {
    await fetchOrders();
    toast({ title: "Refreshed", description: "Orders updated." });
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      // Correctly use the admin API endpoint
      await adminFetch(`/admin/api/orders/${orderToDelete.id}`, { method: "DELETE" });
      setOrders(orders.filter((o) => o.id !== orderToDelete.id));
      toast({ title: "Deleted", description: `Order ${orderToDelete.id} deleted.` });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message });
    } finally {
      setOrderToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditClick = (order: Order) => {
    setOrderToEdit(order);
    setIsEditModalOpen(true);
  };

  const confirmEdit = async () => {
    if (!orderToEdit) return;
    try {
      const payload = {
        pickupDate: orderToEdit.pickupDate,
        total: orderToEdit.total,
        specialInstructions: orderToEdit.specialInstructions,
      };
      // Correctly use the admin API endpoint
      await adminFetch(`/admin/api/orders/${orderToEdit.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setOrders(orders.map((o) => (o.id === orderToEdit.id ? orderToEdit : o)));
      toast({ title: "Updated", description: `Order ${orderToEdit.id} updated.` });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message });
    } finally {
      setOrderToEdit(null);
      setIsEditModalOpen(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Processing": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64" />
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline"><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
          <Button onClick={() => setLocation("/create-order")}><PlusCircle className="h-4 w-4 mr-1" /> New Order</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {["id", "customerName", "service", "total"].map((field) => (
              <TableHead key={field} className="cursor-pointer" onClick={() => handleSort(field as keyof Order)}>
                <div className="flex items-center gap-1">
                  {field === "id" ? "Order ID" : field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </div>
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">No orders found</TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.service}</TableCell>
                <TableCell>₹{order.total.toLocaleString()}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "View", description: `Order ${order.id} clicked` })}><Eye className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(order)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteClick(order)}><X className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="py-2">Delete order {orderToDelete?.id}?</p>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Order {orderToEdit?.id}</DialogTitle></DialogHeader>
          {orderToEdit && (
            <div className="space-y-2">
              <Input
                type="date"
                value={orderToEdit.pickupDate ? orderToEdit.pickupDate.split("T")[0] : ""}
                onChange={(e) => setOrderToEdit({ ...orderToEdit, pickupDate: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Total"
                value={orderToEdit.total}
                onChange={(e) => setOrderToEdit({ ...orderToEdit, total: Number(e.target.value) })}
              />
              <Input
                placeholder="Notes"
                value={orderToEdit.specialInstructions || ""}
                onChange={(e) => setOrderToEdit({ ...orderToEdit, specialInstructions: e.target.value })}
              />
              <DialogFooter className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={confirmEdit} className="bg-blue-600 text-white">Save</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

