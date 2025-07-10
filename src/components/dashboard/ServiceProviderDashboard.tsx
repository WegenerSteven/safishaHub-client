import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { profileService } from '../../services/profile.service';
import { serviceManagementService } from '../../services/service-management.service';
import bookingsService from '../../services/bookings.service.instance';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '../../components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu'
import { Badge } from '../../components/ui/badge'

import { Pencil, Trash2, Plus, Car, Calendar, Clock, MoreHorizontal, PhoneCall, Mail } from 'lucide-react'
import { BookingStatus } from '../../interfaces';
import type { DashboardData } from '../../interfaces/dashboard/dashboard.interface';
import type { Service, ServiceCategory } from '../../services/service-management.service';
import type { Booking } from '../../interfaces';

export function ServiceProviderDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  // --- OVERVIEW TAB STATE AND FUNCTIONS ---
  
  // Fetch dashboard data
  const { data: dashboardStats, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['provider-dashboard'],
    queryFn: profileService.getDashboardData,
  });
  
  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ['provider-services'],
    queryFn: serviceManagementService.getProviderServices,
  });
  
  // --- SERVICE MANAGEMENT TAB STATE AND FUNCTIONS ---
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    category_id: '11111111-1111-1111-1111-111111111111', // Default to a valid UUID
    service_type: 'standard',
    vehicle_type: 'sedan',
    base_price: 0,
    duration_minutes: 60,
    status: 'active', // Only use 'active', 'inactive', or 'draft'
    featured: false,
    is_active: true,
    is_available: true
  });
  
  // Fetch categories
  const { 
    data: categoriesData, 
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError
  } = useQuery({
    queryKey: ['service-categories'],
    queryFn: serviceManagementService.getCategories,
  });
  
  // Process categories data with default values for development
  const categories = useMemo(() => {
    // Default categories for development and fallback with valid UUIDs
    const defaultCategories = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Car Wash",
        description: "Professional car washing services"
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Interior Cleaning",
        description: "Thorough interior cleaning services"
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Exterior Detailing",
        description: "Premium exterior detailing services"
      }
    ];

    // If no data, return defaults
    if (!categoriesData) {
      return defaultCategories;
    }
    
    console.log('Categories data:', categoriesData);
    
    // If it's already an array, use it or fallback to defaults
    if (Array.isArray(categoriesData)) {
      return categoriesData.length > 0 ? categoriesData : defaultCategories;
    }
    
    // Last resort fallback
    return defaultCategories;
  }, [categoriesData]);
  
  // Log any issues with categories
  useEffect(() => {
    if (isCategoriesError) {
      console.error('Error loading categories:', categoriesError);
      toast.error('Failed to load service categories');
    }
    
    if (categories?.length === 0 && !isLoadingCategories && !isCategoriesError) {
      console.warn('No categories loaded');
    } else if (categories?.length > 0) {
      console.log(`Loaded ${categories.length} categories`);
    }
  }, [categories, isCategoriesError, categoriesError, isLoadingCategories]);

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Submitting service data to API:', data);
      return serviceManagementService.createService(data);
    },
    onSuccess: () => {
      toast.success("Your service has been created successfully.");
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      resetServiceForm();
    },
    onError: (error: any) => {
      console.error('Error creating service:', error);
      // Log more details from the error response
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        // Extract more specific error messages if available
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            "Failed to create service. Please check all required fields.";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to create service. Please check all required fields.");
      }
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Service> }) => 
      serviceManagementService.updateService(id, data),
    onSuccess: () => {
      toast.success("Your service has been updated successfully.");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      resetServiceForm();
    },
    onError: (error) => {
      console.error('Error updating service:', error);
      toast.error("Failed to update service. Please try again.");
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: serviceManagementService.deleteService,
    onSuccess: () => {
      toast.success("Your service has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      toast.error("Failed to delete service. Please try again.");
    },
  });
  
  // --- BOOKING MANAGEMENT TAB STATE AND FUNCTIONS ---
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  
  // Fetch bookings
  const {data: bookingsData,isLoading: isLoadingBookings,} = useQuery({queryKey: ['provider-bookings'],queryFn: async () => {
      try {
        const result = await bookingsService.getProviderBookings();
        // Log the result for debugging
        console.log('Provider bookings API response:', result);
        return result;
      } catch (error) {
        console.error('Error fetching provider bookings:', error);
        throw error;
      }
    },
  });
  
  // Ensure bookings is always an array
  const bookings = Array.isArray(bookingsData) ? bookingsData : [];
  
  // Log when bookings is not an array for debugging
  useEffect(() => {
    if (bookingsData && !Array.isArray(bookingsData)) {
      console.warn('Provider bookings is not an array:', bookingsData);
    }
  }, [bookingsData]);
  
  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      bookingsService.updateBooking(id, { status }),
    onSuccess: () => {
      toast.success("The booking status has been updated successfully.");
      setIsUpdateStatusDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      resetStatusForm();
    },
    onError: (error) => {
      console.error('Error updating booking:', error);
      toast.error("Failed to update booking status. Please try again.");
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: bookingsService.cancelBooking,
    onSuccess: () => {
      toast.success("The booking has been cancelled.");
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
    },
    onError: (error) => {
      console.error('Error cancelling booking:', error);
      toast.error("Failed to cancel booking. Please try again.");
    },
  });
  
  // --- AVAILABILITY MANAGEMENT TAB STATE AND FUNCTIONS ---
  // (We'll add this later when we implement this feature)
  
  // --- ANALYTICS TAB STATE AND FUNCTIONS ---
  // (We'll add this later when we implement this feature)
  
  // --- SHARED HELPER FUNCTIONS ---
  
  // Handle form input changes for service management
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'base_price' || name === 'duration_minutes' 
        ? parseFloat(value) 
        : value
    });
  };

  // Handle select input changes for service management
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Reset service form data
  const resetServiceForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '11111111-1111-1111-1111-111111111111', // Default to a valid UUID
      service_type: 'standard',
      vehicle_type: 'sedan',
      base_price: 0,
      duration_minutes: 60,
      status: 'active', // Only use 'active', 'inactive', or 'draft'
      featured: false,
      is_active: true,
      is_available: true
    });
    setSelectedService(null);
  };
  
  // Open edit dialog with service data
  const openEditDialog = (service: Service) => {
    setSelectedService(service);
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
    });
    setIsEditDialogOpen(true);
  };

  // Handle create service
  const handleCreateService = () => {
    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Service name is required');
      return;
    }
    
    if (!formData.description || formData.description.trim() === '') {
      toast.error('Description is required');
      return;
    }
    
    if (!formData.category_id || formData.category_id === '') {
      // If using default category
      if (categories?.length > 0) {
        // Set the first available category
        formData.category_id = categories[0].id;
        console.log('Using first available category:', categories[0].name, 'with ID:', categories[0].id);
      } else {
        toast.error('Please select a category');
        return;
      }
    }
    
    if (!formData.base_price || formData.base_price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    
    // Ensure valid enum values (match backend exactly)
    const validServiceTypes = ['basic', 'standard', 'premium', 'deluxe'];
    const validVehicleTypes = ['sedan', 'suv', 'truck', 'motorcycle', 'van', 'hatchback'];
    const validStatuses = ['active', 'inactive', 'draft'];
    
    // Prepare the data WITHOUT provider_id since backend will handle it from auth
    const serviceData = {
      name: formData.name,
      description: formData.description,
      // Use the correct category ID (must be a valid UUID)
      category_id: formData.category_id || '11111111-1111-1111-1111-111111111111', 
      // Ensure numeric fields are numbers
      base_price: Number(formData.base_price),
      duration_minutes: Number(formData.duration_minutes),
      // Ensure enum values match backend exactly
      service_type: validServiceTypes.includes(String(formData.service_type).toLowerCase()) 
        ? String(formData.service_type).toLowerCase() 
        : 'standard',
      vehicle_type: validVehicleTypes.includes(String(formData.vehicle_type).toLowerCase())
        ? String(formData.vehicle_type).toLowerCase()
        : 'sedan',
      status: validStatuses.includes(String(formData.status).toLowerCase())
        ? String(formData.status).toLowerCase()
        : 'active',
      // Boolean fields
      featured: Boolean(formData.featured),
      is_active: true,
      is_available: true,
    };
    
    // Log the data we're submitting
    console.log('Submitting service data:', serviceData);
    console.log('Service payload:', JSON.stringify(serviceData, null, 2));
    
    // Show loading toast
    const toastId = toast.loading('Creating service...');
    
    try {
      // Submit the form
      createServiceMutation.mutate(serviceData as Service, {
        onSuccess: () => {
          toast.success('Service created successfully!', { id: toastId });
          setIsCreateDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['provider-services'] });
          resetServiceForm();
        },
        onError: (error: any) => {
          console.error('Error creating service:', error);
          
          // Try to extract more detailed error message
          const errorMessage = error?.response?.data?.message || 
                             error?.response?.data?.error || 
                             'Failed to create service. Please try again.';
          
          toast.error(errorMessage, { id: toastId });
        }
      });
    } catch (error) {
      toast.error('Failed to create service. Check the console for details.', { id: toastId });
      console.error('Error in mutation execution:', error);
    }
  };

  // Handle update service
  const handleUpdateService = () => {
    if (selectedService?.id) {
      updateServiceMutation.mutate({ 
        id: selectedService.id, 
        data: formData 
      });
    }
  };

  // Handle delete service
  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(id);
    }
  };
  
  // Open booking details
  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsDialogOpen(true);
  };

  // Open update status dialog
  const openUpdateStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setIsUpdateStatusDialogOpen(true);
  };

  // Handle status update
  const handleUpdateStatus = () => {
    if (selectedBooking?.id && newStatus) {
      updateBookingMutation.mutate({ 
        id: selectedBooking.id, 
        status: newStatus 
      });
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(id);
    }
  };

  // Reset status form
  const resetStatusForm = () => {
    setNewStatus('');
    setStatusNote('');
    setSelectedBooking(null);
  };



  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'secondary';
      case BookingStatus.CONFIRMED:
        return 'secondary';
      case BookingStatus.IN_PROGRESS:
        return 'default';
      case BookingStatus.COMPLETED:
        return 'success';
      case BookingStatus.CANCELLED:
        return 'destructive';
      case BookingStatus.NO_SHOW:
        return 'destructive';
      default:
        return 'outline';
    }
  };
  

  
  // Filter bookings by status - guaranteed to be an array from our above initialization
  const pendingBookings = bookings.filter(booking => 
    booking.status === BookingStatus.PENDING || 
    booking.status === BookingStatus.CONFIRMED
  );
  
  const activeBookings = bookings.filter(booking => 
    booking.status === BookingStatus.IN_PROGRESS
  );
  
  const completedBookings = bookings.filter(booking => 
    booking.status === BookingStatus.COMPLETED
  );
  
  const cancelledBookings = bookings.filter(booking => 
    booking.status === BookingStatus.CANCELLED || 
    booking.status === BookingStatus.NO_SHOW
  );
  
  useEffect(() => {
    if (dashboardStats) {
      setDashboardData(dashboardStats);
    }
  }, [dashboardStats]);
  
  // Loading states
  if (isDashboardLoading) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Service Provider Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your car wash services and bookings
        </p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.stats?.totalBookings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.stats?.totalBookings ? 'Active bookings' : 'No bookings yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{services?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {services?.length ? 'Services offered' : 'Add your services'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {dashboardData?.stats?.monthlyRevenue || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.stats?.monthlyRevenue ? 'This month' : 'Start earning today'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.stats?.rating || '-'}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.stats?.rating ? 'Customer rating' : 'No reviews yet'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentBookings && dashboardData.recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentBookings.map(booking => (
                      <div key={booking.id} className="border-b pb-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{booking.service?.name || "Unknown Service"}</h3>
                            <p className="text-sm text-gray-500">{booking.scheduledDate} at {booking.scheduledTime}</p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No bookings yet. Start promoting your services!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button 
                    onClick={() => setActiveTab("services")} 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Manage Services
                  </button>
                  <button 
                    onClick={() => setActiveTab("bookings")}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Manage Bookings
                  </button>
                  <button 
                    onClick={() => setActiveTab("availability")}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Update Availability
                  </button>
                  <button 
                    onClick={() => setActiveTab("analytics")}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    View Analytics
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* SERVICES TAB */}
        <TabsContent value="services">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Services</h2>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Service
            </Button>
          </div>
          
          {/* Services List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services?.length > 0 ? (
              services.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="text-lg font-semibold">{service.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(service)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id as string)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                      {service.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-lg font-bold">KES {service.base_price}</p>
                        <p className="text-xs text-muted-foreground">{service.duration_minutes} min</p>
                      </div>
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-1" />
                        <p className="text-xs">{service.vehicle_type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No services yet</h3>
                <p className="text-muted-foreground mb-6">Start by adding your first service</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Service
                </Button>
              </div>
            )}
          </div>
          
          {/* Service Creation Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Service</DialogTitle>
                <DialogDescription>
                  Add a new service offering for your customers. Fill in all required information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Premium Car Wash"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category_id">Category <span className="text-red-500">*</span></Label>
                  {isLoadingCategories ? (
                    <div className="p-2 text-center text-sm text-gray-500">Loading categories...</div>
                  ) : isCategoriesError ? (
                    <div className="p-2 text-center text-sm text-red-500">
                      Failed to load categories. Please try again later.
                    </div>
                  ) : (
                    <Select
                      name="category_id"
                      value={formData.category_id}
                      onValueChange={(value) => {
                        console.log('Category selected:', value);
                        handleSelectChange("category_id", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories && categories.length > 0 ? (
                          categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="default" disabled>No categories available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-gray-500">
                    {formData.category_id ? 
                      `Selected category ID: ${formData.category_id}` : 
                      'Category selection is required'}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed description of your service"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="base_price">Price (KES)</Label>
                    <Input
                      id="base_price"
                      name="base_price"
                      type="number"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      min={0}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      min={1}
                    />
                  </div>
                </div>                  <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Service Type</Label>
                    <Select
                      name="service_type"
                      value={formData.service_type}
                      onValueChange={(value) => {
                        console.log('Service type selected:', value);
                        handleSelectChange("service_type", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="deluxe">Deluxe</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Must be one of: basic, standard, premium, deluxe</p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Vehicle Type</Label>
                    <Select
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onValueChange={(value) => {
                        console.log('Vehicle type selected:', value);
                        handleSelectChange("vehicle_type", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="hatchback">Hatchback</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Must be one of: sedan, suv, truck, van, motorcycle, hatchback</p>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) => {
                      console.log('Status selected:', value);
                      handleSelectChange("status", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Must be one of: active, inactive, draft</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateService}>Create Service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Service Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Edit Service</DialogTitle>
                <DialogDescription>
                  Update your service offering details. Make changes to any field as needed.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Same fields as create dialog */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Service Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    name="category_id"
                    value={formData.category_id}
                    onValueChange={(value) => handleSelectChange("category_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">Price (KES)</Label>
                    <Input
                      id="edit-price"
                      name="base_price"
                      type="number"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      min={0}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      name="duration_minutes"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      min={1}
                    />
                  </div>
                </div>
                
                {/* Same remaining fields as create dialog */}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateService}>Update Service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* BOOKINGS TAB */}
        <TabsContent value="bookings">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Manage Bookings</h2>
          </div>
          
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
            </TabsList>
            
            {['pending', 'active', 'completed', 'cancelled'].map((tab) => {
              const tabBookings = tab === 'pending' 
                ? pendingBookings 
                : tab === 'active' 
                ? activeBookings 
                : tab === 'completed' 
                ? completedBookings 
                : cancelledBookings;
                
              return (
                <TabsContent key={tab} value={tab}>
                  {isLoadingBookings ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : tabBookings.length > 0 ? (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tabBookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">
                                {booking.booking_number || booking.id.substring(0, 8)}
                              </TableCell>
                              <TableCell>{booking.service?.name || "Unknown Service"}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{booking.scheduledDate}</span>
                                  <span className="text-muted-foreground text-sm">{booking.scheduledTime}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {booking.user?.first_name || ''} {booking.user?.last_name || ''}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openBookingDetails(booking)}>
                                      View Details
                                    </DropdownMenuItem>
                                    {tab !== 'completed' && tab !== 'cancelled' && (
                                      <DropdownMenuItem onClick={() => openUpdateStatusDialog(booking)}>
                                        Update Status
                                      </DropdownMenuItem>
                                    )}
                                    {tab === 'pending' && (
                                      <DropdownMenuItem 
                                        className="text-destructive" 
                                        onClick={() => handleCancelBooking(booking.id)}>
                                        Cancel Booking
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-md bg-muted/10">
                      <h3 className="text-lg font-semibold mb-2">No {tab} bookings</h3>
                      <p className="text-muted-foreground">
                        {tab === 'pending' 
                          ? "You don't have any pending bookings at the moment."
                          : tab === 'active'
                          ? "You don't have any active bookings currently in progress."
                          : tab === 'completed'
                          ? "No completed bookings to show."
                          : "No cancelled bookings to show."
                        }
                      </p>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
          
          {/* Booking Details Dialog */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
              </DialogHeader>
              {selectedBooking && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Badge variant={getStatusBadgeVariant(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                    <p className="text-sm font-medium">
                      #{selectedBooking.booking_number || selectedBooking.id.substring(0, 8)}
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Service Information</h4>
                    <p className="font-medium">{selectedBooking.service?.name || "Unknown Service"}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.service?.description || ""}</p>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm">Price: <span className="font-medium">KES {selectedBooking.totalAmount || selectedBooking.total_amount}</span></p>
                      <p className="text-sm">Duration: <span className="font-medium">{selectedBooking.service?.duration_minutes || "Unknown"} min</span></p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Appointment Details</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <p className="text-sm">{selectedBooking.scheduledDate}</p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <p className="text-sm">{selectedBooking.scheduledTime}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <p className="font-medium">
                      {selectedBooking.user?.first_name || ''} {selectedBooking.user?.last_name || ''}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center">
                        <PhoneCall className="h-4 w-4 mr-2" />
                        <p className="text-sm">{selectedBooking.user?.phone_number || 'No phone number'}</p>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <p className="text-sm">{selectedBooking.user?.email || 'No email'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedBooking.specialInstructions && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Special Instructions</h4>
                      <p className="text-sm">{selectedBooking.specialInstructions}</p>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                {selectedBooking && selectedBooking.status !== 'completed' && 
                 selectedBooking.status !== 'cancelled' && (
                  <div className="flex gap-2 w-full">
                    {String(selectedBooking.status) !== BookingStatus.COMPLETED && (
                      <Button 
                        className="flex-1" 
                        onClick={() => {
                          setIsDetailsDialogOpen(false);
                          openUpdateStatusDialog(selectedBooking);
                        }}
                      >
                        Update Status
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsDetailsDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
                {(selectedBooking?.status === 'completed' || 
                  selectedBooking?.status === 'cancelled') && (
                  <Button 
                    variant="outline"
                    onClick={() => setIsDetailsDialogOpen(false)}
                  >
                    Close
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Update Status Dialog */}
          <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Update Booking Status</DialogTitle>
                <DialogDescription>
                  Change the status for booking #{selectedBooking?.booking_number || selectedBooking?.id?.substring(0, 8)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={newStatus} 
                    onValueChange={(value) => setNewStatus(value as BookingStatus | '')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={BookingStatus.CONFIRMED}>Confirmed</SelectItem>
                      <SelectItem value={BookingStatus.IN_PROGRESS}>In Progress</SelectItem>
                      <SelectItem value={BookingStatus.COMPLETED}>Completed</SelectItem>
                      <SelectItem value={BookingStatus.CANCELLED}>Cancelled</SelectItem>
                      <SelectItem value={BookingStatus.NO_SHOW}>No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Note (Optional)</Label>
                  <Textarea 
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note about this status change"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateStatus}>Update Status</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* AVAILABILITY TAB */}
        <TabsContent value="availability">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Availability Management</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Set your working hours and manage your availability for bookings.
              This feature is coming soon.
            </p>
            <Button onClick={() => setActiveTab("overview")}>
              Return to Dashboard
            </Button>
          </div>
        </TabsContent>
        
        {/* ANALYTICS TAB */}
        <TabsContent value="analytics">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Analytics & Reporting</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Get insights into your business performance with detailed analytics.
              This feature is coming soon.
            </p>
            <Button onClick={() => setActiveTab("overview")}>
              Return to Dashboard
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}