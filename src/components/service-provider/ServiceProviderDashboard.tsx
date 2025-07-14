import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { serviceManagementService, Service, ServiceCategory } from '@/services/service-management.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Clock, DollarSign, Car, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';

export const ServiceProviderDashboard: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  // Fetch services
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['provider-services'],
    queryFn: serviceManagementService.getProviderServices,
  });

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['service-categories'],
    queryFn: serviceManagementService.getCategories,
  });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<Service>();

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: serviceManagementService.createService,
    onSuccess: () => {
      toast.success('Service created successfully');
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create service');
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) => 
      serviceManagementService.updateService(id, data),
    onSuccess: () => {
      toast.success('Service updated successfully');
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update service');
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: serviceManagementService.deleteService,
    onSuccess: () => {
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete service');
    },
  });

  const openCreateDialog = () => {
    setCurrentService(null);
    reset({
      name: '',
      description: '',
      service_type: 'fixed',
      vehicle_type: 'car',
      base_price: 0,
      duration_minutes: 30,
      featured: false,
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setCurrentService(service);
    reset(service);
    setIsDialogOpen(true);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(id);
    }
  };

  const onSubmit = (data: Service) => {
    if (currentService?.id) {
      updateServiceMutation.mutate({ 
        id: currentService.id, 
        data: {
          ...data,
          base_price: Number(data.base_price),
          duration_minutes: Number(data.duration_minutes),
        }
      });
    } else {
      createServiceMutation.mutate({
        ...data,
        base_price: Number(data.base_price),
        duration_minutes: Number(data.duration_minutes),
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoadingServices || isLoadingCategories) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Your Services</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add New Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-8">
            <p className="text-muted-foreground mb-4">You haven't added any services yet.</p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              {service.image_url && (
                <div className="w-full h-40 overflow-hidden">
                  <img 
                    src={service.image_url} 
                    alt={service.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{service.name}</span>
                  <Badge variant={getStatusBadgeVariant(service.status)}>
                    {service.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {categories.find(cat => cat.id === service.category_id)?.name || 'Unknown Category'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>KES {service.base_price}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{service.duration_minutes} mins</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Car className="h-4 w-4 mr-1" />
                    <span>{service.vehicle_type}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{service.service_type}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => service.id && handleDeleteService(service.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription>
              {currentService 
                ? 'Update your service details below.' 
                : 'Fill in the details to add a new service offering.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input 
                id="name"
                {...register('name', { required: 'Service name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Controller
                name="category_id"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category_id && (
                <p className="text-sm text-red-500">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <Controller
                  name="service_type"
                  control={control}
                  rules={{ required: 'Service type is required' }}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
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
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                <Controller
                  name="vehicle_type"
                  control={control}
                  rules={{ required: 'Vehicle type is required' }}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
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
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price (KES)</Label>
                <Input 
                  id="base_price"
                  type="number"
                  {...register('base_price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price cannot be negative' }
                  })}
                />
                {errors.base_price && (
                  <p className="text-sm text-red-500">{errors.base_price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (Minutes)</Label>
                <Input 
                  id="duration_minutes"
                  type="number"
                  {...register('duration_minutes', { 
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 minute' }
                  })}
                />
                {errors.duration_minutes && (
                  <p className="text-sm text-red-500">{errors.duration_minutes.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured Service</Label>
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <Switch 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
              >
                {createServiceMutation.isPending || updateServiceMutation.isPending
                  ? 'Saving...'
                  : currentService ? 'Update Service' : 'Create Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
