import { useEffect, useState } from 'react';
import { ServiceTable } from './ServiceTable';
import { ServiceFormDialog } from './ServiceFormDialog';
import { BusinessRegistrationPrompt } from './BusinessRegistrationPrompt';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusiness, useBusinessServices } from '@/hooks/useBusinessServices';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { useCreateServiceMutation, useUpdateServiceMutation, useDeleteServiceMutation } from '@/hooks/useServiceMutations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// import { servicesService, businessService } from '@/services';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import type { Service } from '@/interfaces/service/Service.interface';
import { ServiceType, VehicleType } from '@/interfaces/service/Service.interface';

// Form validation schema
const serviceFormSchema = z.object({
  name: z.string().min(2, { message: 'Service name is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category_id: z.string().uuid({ message: 'Select a valid category' }),
  service_type: z.nativeEnum(ServiceType),
  base_price: z.coerce.number().min(0, { message: 'Price must be a positive number' }), // Changed to base_price
  duration_minutes: z.coerce.number().min(5, { message: 'Duration must be at least 5 minutes' }),
  vehicle_type: z.nativeEnum(VehicleType),
  is_available: z.boolean().default(true), // Added to schema
  business_id: z.string().uuid().optional(), // Added to match DTO
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export function ServiceManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  // Use custom hooks for data fetching
  const { data: myBusiness, isLoading: isLoadingBusiness, error: businessError } = useBusiness();
  const { data: services, isLoading: isLoadingServices } = useBusinessServices(myBusiness?.id);
  const { data: categories, isLoading: isLoadingCategories } = useServiceCategories();


  // FIXED: Initialize form with correct field names
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      service_type: ServiceType.STANDARD,
      base_price: 0, // Changed from price to base_price
      duration_minutes: 30,
      vehicle_type: VehicleType.SEDAN,
      is_available: true,
      business_id: myBusiness?.id, // Added business_id
    },
  });

  // Create service mutation
  const createServiceMutation = useCreateServiceMutation(myBusiness?.id, imageFile, () => {
    setIsDialogOpen(false);
    form.reset();
    setImageFile(null);
  });

  // FIXED: Added useEffect to update business_id when myBusiness changes
  useEffect(() => {
    if (myBusiness?.id) {
      form.setValue('business_id', myBusiness.id);
    }
  }, [myBusiness, form]);


  // Update service mutation
  const updateServiceMutation = useUpdateServiceMutation(myBusiness?.id, currentServiceId ?? undefined, () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setCurrentServiceId(null);
    form.reset();
  });

  // Delete service mutation
  const deleteServiceMutation = useDeleteServiceMutation(myBusiness?.id);



  // FIXED: Simplified form submission
  const onSubmit = (data: ServiceFormValues) => {
    console.log(`Submitting service data:`, data);
    // Ensure business_id is set
    const payload = {
      ...data,
      business_id: myBusiness?.id,
    };

    if (isEditing && currentServiceId) {
      updateServiceMutation.mutate(payload);
    } else {
      createServiceMutation.mutate(payload);
    }
  };

  // FIXED: Handle edit service with correct field names
  const handleEditService = (service: Service) => {
    setCurrentServiceId(service.id || '');
    setIsEditing(true);

    form.reset({
      name: service.name || '',
      description: service.description || '',
      category_id: service.category_id || '',
      service_type: service.service_type || '',
      base_price: service.base_price || 0, // Changed to base_price
      duration_minutes: service.duration_minutes || 30,
      vehicle_type: service.vehicle_type || VehicleType.SEDAN,
      is_available: service.is_available ?? true,
      business_id: service.business_id || '',
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
    return <BusinessRegistrationPrompt />;
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
      ) : (
        <ServiceTable services={services ?? []} onEdit={handleEditService} onDelete={handleDeleteService} />
      )}

      <ServiceFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={isEditing}
        form={form}
        categories={categories}
        isLoadingCategories={isLoadingCategories}
        imageFile={imageFile}
        setImageFile={setImageFile}
        createServiceMutation={createServiceMutation}
        updateServiceMutation={updateServiceMutation}
        onSubmit={onSubmit}
      />
    </div>
  );
}
