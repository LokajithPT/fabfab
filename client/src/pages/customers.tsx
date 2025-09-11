import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

import { 
  ListFilter, MoreHorizontal, PlusCircle, Search 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

type Customer = {
  id: number
  name: string
  email: string
  phone: string
}

// -------------- HELPER: AUTH FETCH -------------- //
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token")
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401) {
    console.error("Unauthorized! JWT might be expired. Please login again.")
  }
  return res
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  // -------------- FETCH ALL CUSTOMERS -------------- //
  const fetchCustomers = async () => {
    try {
      const res = await authFetch("/admin/api/customers", { method: "GET" })
      if (!res.ok) throw await res.json()
      const data = await res.json()
      setCustomers(data)
    } catch (err: any) {
      toast({ title: "Error", description: err.error || "Failed to fetch customers", variant: "destructive" })
    }
  }

  useEffect(() => { fetchCustomers() }, [])

  // -------------- CREATE CUSTOMER -------------- //
  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" })
      return
    }

    try {
      const res = await authFetch("/admin/api/customers", {
        method: "POST",
        body: JSON.stringify(newCustomer),
      })
      if (!res.ok) throw await res.json()
      await fetchCustomers()
      toast({ title: "Customer Created", description: `Welcome email sent to ${newCustomer.email}` })
      setNewCustomer({ name: "", email: "", phone: "" })
    } catch (err: any) {
      toast({ title: "Error", description: err.error || "Failed to create customer", variant: "destructive" })
    }
  }

  // -------------- UPDATE CUSTOMER -------------- //
  const handleUpdateCustomer = async (updated: Customer) => {
    try {
      const res = await authFetch(`/admin/api/customers/${updated.id}`, {
        method: "PUT",
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw await res.json()
      await fetchCustomers()
      toast({ title: "Customer updated successfully" })
      setIsEditDialogOpen(false)
    } catch (err: any) {
      toast({ title: "Error", description: err.error || "Failed to update customer", variant: "destructive" })
    }
  }

  // -------------- DELETE CUSTOMER -------------- //
  const handleDeleteCustomer = async (id: number) => {
    try {
      const res = await authFetch(`/admin/api/customers/${id}`, { method: "DELETE" })
      if (!res.ok) throw await res.json()
      await fetchCustomers()
      toast({ title: "Customer deleted" })
    } catch (err: any) {
      toast({ title: "Error", description: err.error || "Failed to delete customer", variant: "destructive" })
    }
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      {/* Total Customers KPI */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        <Card>
          <CardHeader><CardTitle>Total Customers</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{customers.length}</div></CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Manage your customers and view their order history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers..." className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
              </Button>

              {/* Add Customer Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Customer</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
                  <div className="py-4 space-y-4">
                    <div><Label>Name *</Label><Input value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} /></div>
                    <div><Label>Email *</Label><Input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} /></div>
                    <div><Label>Phone *</Label><Input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} /></div>
                    <Button onClick={handleCreateCustomer} className="w-full">Create Customer</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">No customers found</TableCell></TableRow>
              ) : (
                customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.phone}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setSelectedCustomer(c); setIsEditDialogOpen(true) }}>Edit</DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-500" onSelect={e => e.preventDefault()}>Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCustomer(c.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">Showing <strong>{customers.length}</strong> customers</div>
        </CardFooter>
      </Card>

      {/* Edit Customer Dialog */}
      {selectedCustomer && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
              <div><Label>Name</Label><Input value={selectedCustomer.name} onChange={e => setSelectedCustomer({...selectedCustomer, name: e.target.value})} /></div>
              <div><Label>Email</Label><Input value={selectedCustomer.email} onChange={e => setSelectedCustomer({...selectedCustomer, email: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={selectedCustomer.phone} onChange={e => setSelectedCustomer({...selectedCustomer, phone: e.target.value})} /></div>
              <Button onClick={() => selectedCustomer && handleUpdateCustomer(selectedCustomer)}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

