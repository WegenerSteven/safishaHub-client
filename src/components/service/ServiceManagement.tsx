import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { servicesService, businessService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Pencil, Trash } from 'lucide-react';
import type { Service } from '@/interfaces/service/Service.interface';
import { ServiceType, VehicleType } from '@/interfaces/service/Service.interface';

// Form validation schema
const serviceFormSchema = z.object({
  name: z.string().min(2, { message: 'Service name is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  short_description: z.string().min(5, { message: 'Short description is required' }),
  category_id: z.string({ required_error: 'Category is required' }),
  service_type: z.nativeEnum(ServiceType),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number' }),
  duration_minutes: z.coerce.number().min(5, { message: 'Duration must be at least 5 minutes' }),
  vehicle_type: z.nativeEnum(VehicleType),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export function ServiceManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get business ID
  const { data: myBusiness, isLoading: isLoadingBusiness, error: businessError } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessService.getMyBusiness(),
    retry: 1,
  });

  // Get business services
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['business-services', myBusiness?.id],
    queryFn: () => myBusiness ? businessService.getBusinessServices(myBusiness.id) : Promise.resolve([]),
    enabled: !!myBusiness?.id,
  });

  // Get service categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => servicesService.getCategories(),
  });

  // Initialize form
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      short_description: '',
      category_id: '',
      service_type: ServiceType.STANDARD,
      price: 0,
      duration_minutes: 30,
      vehicle_type: VehicleType.SEDAN,
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceFormValues) => {
      return servicesService.createService({
        ...data,
        business_id: myBusiness?.id,
      });
    },
    onSuccess: () => {
      toast.success('Service created successfully');
      queryClient.invalidateQueries({ queryKey: ['business-services', myBusiness?.id] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create service');
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: (data: ServiceFormValues) => {
      if (!currentServiceId) throw new Error('No service ID to update');
      return servicesService.updateService(currentServiceId, {
        ...data,
        business_id: myBusiness?.id,
      });
    },
    onSuccess: () => {
      toast.success('Service updated successfully');
      queryClient.invalidateQueries({ queryKey: ['business-services', myBusiness?.id] });
      setIsDialogOpen(false);
      setIsEditing(false);
      setCurrentServiceId(null);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update service');
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => servicesService.deleteService(serviceId),
    onSuccess: () => {
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['business-services', myBusiness?.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    },
  });

  // Handle form submission
  const onSubmit = (data: ServiceFormValues) => {
    if (isEditing && currentServiceId) {
      updateServiceMutation.mutate(data);
    } else {
      createServiceMutation.mutate(data);
    }
  };

  // Handle edit service
  const handleEditService = (service: Service) => {
    setCurrentServiceId(service.id);
    setIsEditing(true);

    // Set form values from the service
    form.reset({
      name: service.name,
      description: service.description,
      short_description: service.short_description || '',
      category_id: service.category_id,
      service_type: service.service_type,    
      price: service.price || Number(service.base_price),
      duration_minutes: service.duration_minutes || 30,
      vehicle_type: service.vehicle_type || VehicleType.SEDAN,
    });

    setIsDialogOpen(true);
  };

  // Handle delete service
  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setIsEditing(false);
      setCurrentServiceId(null);
      form.reset();
    }
  }, [isDialogOpen, form]);

  // Show business registration prompt if no business exists
  if (businessError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Please register your business first</h3>
            <p className="text-muted-foreground">
              You need to register your business before you can manage services.
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard/business/register'}
              className="mt-4"
            >
              Register Business
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoadingBusiness) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Services</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Service
        </Button>
      </div>

      {isLoadingServices ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : services && services.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.service_type}</TableCell>
                    <TableCell>
                      {service.price ?
                        `$${service.price.toFixed(2)}` :
                        'Not set'}
                    </TableCell>
                    <TableCell>{service.category?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditService(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteService(service.id!)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No services found. Add your first service.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter service name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <div className="flex justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            Array.isArray(categories) && categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ServiceType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description (shown in lists)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed service description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (KES)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="5" step="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(VehicleType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
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
                  {(createServiceMutation.isPending || updateServiceMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditing ? 'Update Service' : 'Add Service'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
