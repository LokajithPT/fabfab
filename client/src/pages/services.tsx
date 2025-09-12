import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Service } from "@shared/schema"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Services() {
  const queryClient = useQueryClient()

  // ✅ All queries now hit /admin/api/services
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/admin/api/services"],
    queryFn: async () => {
      const res = await fetch("/admin/api/services")
      if (!res.ok) throw new Error("Failed to fetch services")
      return res.json()
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newService: Partial<Service>) => {
      const res = await fetch("/admin/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      })
      if (!res.ok) throw new Error("Failed to create service")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/api/services"] }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Service> }) => {
      const res = await fetch(`/admin/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error("Failed to update service")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/api/services"] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/admin/api/services/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete service")
      return id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/api/services"] }),
  })

  const [newService, setNewService] = useState({ name: "", price: "", duration: "" })
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleSaveNewService = () => {
    if (!newService.name || !newService.price) return
    createMutation.mutate({
      name: newService.name,
      price: newService.price,
      duration: newService.duration,
      status: "Active",
      usage_count: 0,
    })
    setNewService({ name: "", price: "", duration: "" })
  }

  const handleSaveEdit = () => {
    if (!selectedService) return
    updateMutation.mutate({
      id: selectedService.id,
      updates: {
        name: selectedService.name,
        price: selectedService.price,
        duration: selectedService.duration,
      },
    })
    setIsEditDialogOpen(false)
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div>
              <CardTitle>Services</CardTitle>
              <CardDescription>
                Manage your services and view their details.
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label htmlFor="serviceName">Service Name</Label>
                      <Input id="serviceName" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="servicePrice">Price</Label>
                      <Input id="servicePrice" type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="serviceDuration">Duration</Label>
                      <Input id="serviceDuration" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} />
                    </div>
                    <Button onClick={handleSaveNewService}>Save Service</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading services...</TableCell>
                </TableRow>
              ) : (
                services?.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>₹{parseFloat(service.price).toFixed(2)}</TableCell>
                    <TableCell>{service.duration}</TableCell>
                    <TableCell>
                      <Badge variant={service.status === "Active" ? "default" : "secondary"}>
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.usage_count}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedService(service)
                            setIsEditDialogOpen(true)
                          }}>Edit</DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-500" onSelect={(e) => e.preventDefault()}>
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the service.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(service.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{services?.length || 0}</strong> services
          </div>
        </CardFooter>
      </Card>

      {selectedService && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="serviceName">Service Name</Label>
                <Input id="serviceName" value={selectedService.name} onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="servicePrice">Price</Label>
                <Input id="servicePrice" type="number" value={selectedService.price} onChange={(e) => setSelectedService({ ...selectedService, price: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="serviceDuration">Duration</Label>
                <Input id="serviceDuration" value={selectedService.duration} onChange={(e) => setSelectedService({ ...selectedService, duration: e.target.value })} />
              </div>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

