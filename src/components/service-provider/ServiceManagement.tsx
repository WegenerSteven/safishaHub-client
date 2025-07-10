import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { serviceManagementService } from '@/services/service-management.service'
import { Pencil, Trash2, Plus, Car, AlertCircle, CheckCircle } from 'lucide-react'
import type { Service, ServiceCategory } from '@/services/service-management.service'

export function ServiceManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    category_id: '',
    service_type: 'fixed',
    vehicle_type: 'car',
    base_price: 0,
    duration_minutes: 60,
    status: 'active',
    provider_id: '', // This will be filled from the API
    featured: false,
  })

  const queryClient = useQueryClient()

  // Fetch services
  const { 
    data: services, 
    isLoading: isLoadingServices,
    error: servicesError 
  } = useQuery({
    queryKey: ['provider-services'],
    queryFn: serviceManagementService.getProviderServices,
  })

  // Fetch categories
  const { 
    data: categories, 
    isLoading: isLoadingCategories,
    error: categoriesError 
  } = useQuery({
    queryKey: ['service-categories'],
    queryFn: serviceManagementService.getCategories,
  })

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: serviceManagementService.createService,
    onSuccess: () => {
      toast.success("Your service has been created successfully.")
      setIsCreateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['provider-services'] })
      resetForm()
    },
    onError: (error) => {
      console.error('Error creating service:', error)
      toast.error("Failed to create service. Please try again.")
    },
  })

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Service> }) => 
      serviceManagementService.updateService(id, data),
    onSuccess: () => {
      toast.success("Your service has been updated successfully.")
      setIsEditDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['provider-services'] })
      resetForm()
    },
    onError: (error) => {
      console.error('Error updating service:', error)
      toast.error("Failed to update service. Please try again.")
    },
  })

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: serviceManagementService.deleteService,
    onSuccess: () => {
      toast.success("Your service has been deleted successfully.")
      queryClient.invalidateQueries({ queryKey: ['provider-services'] })
    },
    onError: (error) => {
      console.error('Error deleting service:', error)
      toast.error("Failed to delete service. Please try again.")
    },
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'base_price' || name === 'duration_minutes' 
        ? parseFloat(value) 
        : value
    })
  }

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      service_type: 'fixed',
      vehicle_type: 'car',
      base_price: 0,
      duration_minutes: 60,
      status: 'active',
      provider_id: '',
      featured: false,
    })
    setSelectedService(null)
  }

  // Open edit dialog with service data
  const openEditDialog = (service: Service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      description: service.description,
      category_id: service.category_id,
      service_type: service.service_type,
      vehicle_type: service.vehicle_type,
      base_price: service.base_price,
      duration_minutes: service.duration_minutes,
      status: service.status,
      provider_id: service.provider_id,
      featured: service.featured || false,
    })
    setIsEditDialogOpen(true)
  }

  // Handle create service
  const handleCreateService = () => {
    createServiceMutation.mutate(formData as Service)
  }

  // Handle update service
  const handleUpdateService = () => {
    if (selectedService?.id) {
      updateServiceMutation.mutate({ 
        id: selectedService.id, 
        data: formData 
      })
    }
  }

  // Handle delete service
  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(id)
    }
  }

  // Loading and error states
  if (isLoadingServices || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (servicesError || categoriesError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-destructive mb-2" />
        <h2 className="text-2xl font-semibold">Error Loading Data</h2>
        <p className="text-muted-foreground">
          Please try refreshing the page or check your connection.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Service
        </Button>
      </div>

      {/* Service List */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Services</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Services</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {services && services.filter(s => s.status === 'active').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .filter(service => service.status === 'active')
                .map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service}
                    onEdit={() => openEditDialog(service)}
                    onDelete={() => handleDeleteService(service.id!)}
                    categories={categories || []}
                  />
                ))
              }
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 border rounded-md bg-muted/50">
              <Car className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Services</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't added any active services yet. Create a service to start receiving bookings.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Service
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="mt-4">
          {services && services.filter(s => s.status === 'inactive').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .filter(service => service.status === 'inactive')
                .map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service}
                    onEdit={() => openEditDialog(service)}
                    onDelete={() => handleDeleteService(service.id!)}
                    categories={categories || []}
                  />
                ))
              }
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 border rounded-md bg-muted/50">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Inactive Services</h3>
              <p className="text-muted-foreground text-center">
                You don't have any inactive services.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Service Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service offering for your customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input 
                id="name"
                name="name"
                placeholder="Premium Car Wash" 
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleSelectChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                placeholder="Full exterior and interior cleaning..." 
                className="h-20"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <Select 
                value={formData.service_type} 
                onValueChange={(value: 'mobile' | 'fixed' | 'both') => handleSelectChange('service_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Location</SelectItem>
                  <SelectItem value="mobile">Mobile Service</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select 
                value={formData.vehicle_type} 
                onValueChange={(value: 'car' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'all') => handleSelectChange('vehicle_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="all">All Types</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price (KES)</Label>
              <Input 
                id="base_price"
                name="base_price"
                type="number" 
                placeholder="1500" 
                value={formData.base_price}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input 
                id="duration_minutes"
                name="duration_minutes"
                type="number" 
                placeholder="60" 
                value={formData.duration_minutes}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsCreateDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateService} disabled={createServiceMutation.isPending}>
              {createServiceMutation.isPending && (
                <span className="animate-spin mr-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              )}
              Create Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update your service details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Service Name</Label>
              <Input 
                id="edit-name"
                name="name"
                placeholder="Premium Car Wash" 
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category_id">Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleSelectChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                name="description"
                placeholder="Full exterior and interior cleaning..." 
                className="h-20"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-service_type">Service Type</Label>
              <Select 
                value={formData.service_type} 
                onValueChange={(value: 'mobile' | 'fixed' | 'both') => handleSelectChange('service_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Location</SelectItem>
                  <SelectItem value="mobile">Mobile Service</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-vehicle_type">Vehicle Type</Label>
              <Select 
                value={formData.vehicle_type} 
                onValueChange={(value: 'car' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'all') => handleSelectChange('vehicle_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="all">All Types</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-base_price">Base Price (KES)</Label>
              <Input 
                id="edit-base_price"
                name="base_price"
                type="number" 
                placeholder="1500" 
                value={formData.base_price}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration_minutes">Duration (minutes)</Label>
              <Input 
                id="edit-duration_minutes"
                name="duration_minutes"
                type="number" 
                placeholder="60" 
                value={formData.duration_minutes}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'active' | 'inactive') => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateService} disabled={updateServiceMutation.isPending}>
              {updateServiceMutation.isPending && (
                <span className="animate-spin mr-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              )}
              Update Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  categories: ServiceCategory[];
}

function ServiceCard({ service, onEdit, onDelete, categories }: ServiceCardProps) {
  const category = categories.find(c => c.id === service.category_id);
  
  return (
    <Card className="overflow-hidden">
      {service.image_url ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          <Car className="h-10 w-10 text-muted-foreground" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{service.name}</CardTitle>
            <CardDescription>{category?.name || 'Unknown Category'}</CardDescription>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {service.status === 'active' ? 'Active' : 'Inactive'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {service.description || 'No description provided.'}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium">Price</p>
            <p>KES {service.base_price}</p>
          </div>
          <div>
            <p className="font-medium">Duration</p>
            <p>{service.duration_minutes} mins</p>
          </div>
          <div>
            <p className="font-medium">Type</p>
            <p className="capitalize">{service.service_type}</p>
          </div>
          <div>
            <p className="font-medium">Vehicle</p>
            <p className="capitalize">{service.vehicle_type}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
