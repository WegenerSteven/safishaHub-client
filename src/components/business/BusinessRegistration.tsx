import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Building, 
  MapPin, 
  Wrench,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  DollarSign,
  Car,
  Package
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { businessRegistrationService } from '@/services/business-registration.service';
import type { 
  BusinessRegistrationData, 
  BusinessRegistrationStep,
  ServiceOffering,
  ServicePricing,
  ServiceAddOn
} from '@/interfaces/business/BusinessRegistration.interface';

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual/Sole Proprietor' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'company', label: 'Limited Company' },
  { value: 'cooperative', label: 'Cooperative Society' }
];

const SERVICE_TYPES = [
  { value: 'basic', label: 'Basic Wash' },
  { value: 'standard', label: 'Standard Wash' },
  { value: 'premium', label: 'Premium Wash' },
  { value: 'deluxe', label: 'Deluxe Wash' }
];

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'motorcycle', label: 'Motorcycle' }
];

const PRICING_TIERS = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' }
];

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
  'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho', 'Migori', 'Kisii'
];

export function BusinessRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState<BusinessRegistrationData>({
    personal_information: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      id_number: ''
    },
    business_details: {
      business_name: '',
      business_description: '',
      business_type: 'individual',
      business_license: '',
      tax_pin: '',
      years_of_experience: 0,
      specializations: []
    },
    address_location: {
      address: '',
      city: '',
      county: '',
      postal_code: '',
      country: 'Kenya',
      service_areas: []
    },
    services_offered: [],
    terms_accepted: false,
    data_consent: false
  });

  // Auto-fill personal information from current user
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        personal_information: {
          ...prev.personal_information,
          first_name: user.firstName || user.first_name || '',
          last_name: user.lastName || user.last_name || '',
          email: user.email || '',
          phone: user.phone || ''
        }
      }));
    }
  }, []);

  // Load draft data
  const { data: draftData } = useQuery({
    queryKey: ['business-registration-draft'],
    queryFn: businessRegistrationService.getDraft,
    refetchOnWindowFocus: false
  });

  // Load draft data when available
  useEffect(() => {
    if (draftData) {
      setFormData(prev => ({
        ...prev,
        ...draftData
      }));
    }
  }, [draftData]);

  // Load service categories
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['service-categories'],
    queryFn: businessRegistrationService.getServiceCategories,
  });

  // Log any errors from categories query
  useEffect(() => {
    if (categoriesError) {
      console.error('Failed to load categories:', categoriesError);
    }
  }, [categoriesError]);

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Auto-save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: businessRegistrationService.saveDraft,
    onError: (error) => {
      console.error('Failed to save draft:', error);
    }
  });

  // Submit registration mutation
  const submitMutation = useMutation({
    mutationFn: businessRegistrationService.submitApplication,
    onSuccess: () => {
      toast.success('Business registration submitted successfully! We will review your application and get back to you soon.');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to submit registration. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error types
      if (error?.response?.status === 400) {
        errorMessage = 'Please check your information and try again. ' + (error.response.data?.message || 'Invalid data provided.');
      } else if (error?.response?.status === 409) {
        errorMessage = 'An account with this email already exists. Please use a different email or sign in.';
      } else if (error?.response?.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      }
      
      toast.error(errorMessage);
    }
  });

  // Auto-save every 30 seconds (only if form has data)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only save if there's meaningful form data
      if (formData.personal_information?.first_name || 
          formData.business_details?.business_name || 
          formData.address_location?.county ||
          formData.services_offered?.length) {
        saveDraftMutation.mutate(formData);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const steps: BusinessRegistrationStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Your basic personal details',
      completed: currentStep > 0,
      current: currentStep === 0
    },
    {
      id: 'business',
      title: 'Business Details',
      description: 'Information about your business',
      completed: currentStep > 1,
      current: currentStep === 1
    },
    {
      id: 'location',
      title: 'Address & Location',
      description: 'Where you operate from',
      completed: currentStep > 2,
      current: currentStep === 2
    },
    {
      id: 'services',
      title: 'Services Offered',
      description: 'What services you provide',
      completed: currentStep > 3,
      current: currentStep === 3
    }
  ];

  const updateFormData = (section: keyof BusinessRegistrationData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any), ...data }
    }));
  };

  const addServiceOffering = () => {
    const newService: ServiceOffering = {
      category_id: safeCategories[0]?.id || '',
      service_type: 'basic',
      name: '',
      description: '',
      short_description: '',
      features: [],
      requirements: [],
      pricing: VEHICLE_TYPES.map(vehicle => ({
        vehicle_type: vehicle.value,
        pricing_tier: 'standard' as const,
        price: 0,
        estimated_duration: 60
      })),
      addons: [],
      image_url: ''
    };
    
    setFormData(prev => ({
      ...prev,
      services_offered: [...prev.services_offered, newService]
    }));
  };

  const updateServiceOffering = (index: number, updates: Partial<ServiceOffering>) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.map((service, i) => 
        i === index ? { ...service, ...updates } : service
      )
    }));
  };

  const updateServicePricing = (serviceIndex: number, vehicleType: string, updates: Partial<ServicePricing>) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.map((service, i) => 
        i === serviceIndex ? {
          ...service,
          pricing: service.pricing.map(pricing => 
            pricing.vehicle_type === vehicleType ? { ...pricing, ...updates } : pricing
          )
        } : service
      )
    }));
  };

  const addServiceAddon = (serviceIndex: number) => {
    const newAddon = {
      name: '',
      description: '',
      price: 0,
      is_active: true
    };

    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.map((service, i) => 
        i === serviceIndex ? {
          ...service,
          addons: [...service.addons, newAddon]
        } : service
      )
    }));
  };

  const updateServiceAddon = (serviceIndex: number, addonIndex: number, updates: Partial<ServiceAddOn>) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.map((service, i) => 
        i === serviceIndex ? {
          ...service,
          addons: service.addons.map((addon, j) => 
            j === addonIndex ? { ...addon, ...updates } : addon
          )
        } : service
      )
    }));
  };

  const removeServiceAddon = (serviceIndex: number, addonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.map((service, i) => 
        i === serviceIndex ? {
          ...service,
          addons: service.addons.filter((_, j) => j !== addonIndex)
        } : service
      )
    }));
  };

  const removeServiceOffering = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.filter((_, i) => i !== index)
    }));
  };

  const addSpecialization = (specialization: string) => {
    if (specialization && !formData.business_details.specializations.includes(specialization)) {
      updateFormData('business_details', {
        specializations: [...formData.business_details.specializations, specialization]
      });
    }
  };

  const removeSpecialization = (specialization: string) => {
    updateFormData('business_details', {
      specializations: formData.business_details.specializations.filter(s => s !== specialization)
    });
  };

  const addServiceArea = (area: string) => {
    if (area && !formData.address_location.service_areas.includes(area)) {
      updateFormData('address_location', {
        service_areas: [...formData.address_location.service_areas, area]
      });
    }
  };

  const removeServiceArea = (area: string) => {
    updateFormData('address_location', {
      service_areas: formData.address_location.service_areas.filter(a => a !== area)
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Personal Information
        return !!(
          formData.personal_information.first_name &&
          formData.personal_information.last_name &&
          formData.personal_information.email &&
          formData.personal_information.phone
        );
      case 1: // Business Details
        return !!(
          formData.business_details.business_name &&
          formData.business_details.business_description &&
          formData.business_details.years_of_experience > 0
        );
      case 2: // Address & Location
        return !!(
          formData.address_location.address &&
          formData.address_location.city &&
          formData.address_location.county
        );
      case 3: // Services Offered
        return formData.services_offered.length > 0;
      default:
        return false;
    }
  };

  const canProceed = validateStep(currentStep);

  const handleNext = () => {
    if (canProceed && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      saveDraftMutation.mutate(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.terms_accepted || !formData.data_consent) {
      toast.error('Please accept the terms and conditions and data processing consent.');
      return;
    }

    if (!validateStep(3)) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Register Your Car Wash Business
        </h1>
        <p className="text-gray-600">
          Complete this application to become a verified service provider on SafishaHub
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2
                ${step.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : step.current 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }
              `}>
                {step.completed ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-300 ml-3 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 0 && <User className="w-5 h-5" />}
            {currentStep === 1 && <Building className="w-5 h-5" />}
            {currentStep === 2 && <MapPin className="w-5 h-5" />}
            {currentStep === 3 && <Wrench className="w-5 h-5" />}
            {steps[currentStep]?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.personal_information.first_name}
                    onChange={(e) => updateFormData('personal_information', { first_name: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.personal_information.last_name}
                    onChange={(e) => updateFormData('personal_information', { last_name: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.personal_information.email}
                    onChange={(e) => updateFormData('personal_information', { email: e.target.value })}
                    placeholder="Enter your email"
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.personal_information.phone}
                    onChange={(e) => updateFormData('personal_information', { phone: e.target.value })}
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.personal_information.date_of_birth}
                    onChange={(e) => updateFormData('personal_information', { date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="id_number">National ID Number</Label>
                  <Input
                    id="id_number"
                    value={formData.personal_information.id_number}
                    onChange={(e) => updateFormData('personal_information', { id_number: e.target.value })}
                    placeholder="Enter your ID number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_details.business_name}
                  onChange={(e) => updateFormData('business_details', { business_name: e.target.value })}
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <Label htmlFor="business_description">Business Description *</Label>
                <Textarea
                  id="business_description"
                  rows={4}
                  value={formData.business_details.business_description}
                  onChange={(e) => updateFormData('business_details', { business_description: e.target.value })}
                  placeholder="Describe your car wash business, services, and what makes you unique..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select
                    value={formData.business_details.business_type}
                    onValueChange={(value) => updateFormData('business_details', { business_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="years_of_experience">Years of Experience *</Label>
                  <Input
                    id="years_of_experience"
                    type="number"
                    min="0"
                    value={formData.business_details.years_of_experience}
                    onChange={(e) => updateFormData('business_details', { years_of_experience: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_license">Business License Number</Label>
                  <Input
                    id="business_license"
                    value={formData.business_details.business_license}
                    onChange={(e) => updateFormData('business_details', { business_license: e.target.value })}
                    placeholder="Enter license number"
                  />
                </div>
                <div>
                  <Label htmlFor="tax_pin">Tax PIN</Label>
                  <Input
                    id="tax_pin"
                    value={formData.business_details.tax_pin}
                    onChange={(e) => updateFormData('business_details', { tax_pin: e.target.value })}
                    placeholder="Enter KRA PIN"
                  />
                </div>
              </div>

              <div>
                <Label>Specializations</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.business_details.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                      {spec}
                      <button
                        onClick={() => removeSpecialization(spec)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add specialization (e.g., Luxury Cars, Mobile Service)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSpecialization(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value) {
                        addSpecialization(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address & Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Textarea
                  id="address"
                  rows={3}
                  value={formData.address_location.address}
                  onChange={(e) => updateFormData('address_location', { address: e.target.value })}
                  placeholder="Enter your full business address..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City/Town *</Label>
                  <Input
                    id="city"
                    value={formData.address_location.city}
                    onChange={(e) => updateFormData('address_location', { city: e.target.value })}
                    placeholder="Enter city or town"
                  />
                </div>
                <div>
                  <Label htmlFor="county">County *</Label>
                  <Select
                    value={formData.address_location.county}
                    onValueChange={(value) => updateFormData('address_location', { county: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {KENYAN_COUNTIES.map(county => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.address_location.postal_code}
                  onChange={(e) => updateFormData('address_location', { postal_code: e.target.value })}
                  placeholder="Enter postal code"
                />
              </div>

              <div>
                <Label>Service Areas</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Areas where you can provide mobile car wash services
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.address_location.service_areas.map((area) => (
                    <Badge key={area} variant="secondary" className="flex items-center gap-1">
                      {area}
                      <button
                        onClick={() => removeServiceArea(area)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add service area (e.g., Westlands, Karen, CBD)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addServiceArea(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value) {
                        addServiceArea(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Services Offered */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Services You Offer</h3>
                  <p className="text-sm text-gray-600">
                    Add the different car wash services you provide
                  </p>
                </div>
                <Button 
                  onClick={addServiceOffering} 
                  variant="outline"
                  disabled={categoriesLoading || safeCategories.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {categoriesLoading ? 'Loading...' : 'Add Service'}
                </Button>
              </div>

              {formData.services_offered.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No services added yet. Click "Add Service" to get started.</p>
                </div>
              )}

              {formData.services_offered.map((service, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Service {index + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeServiceOffering(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Service Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Service Category</Label>
                        <Select
                          value={service.category_id}
                          onValueChange={(value) => updateServiceOffering(index, { category_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="" disabled>Loading categories...</SelectItem>
                          ) : categoriesError ? (
                            <SelectItem value="" disabled>Error loading categories</SelectItem>
                          ) : safeCategories.length === 0 ? (
                            <SelectItem value="" disabled>No categories available</SelectItem>
                          ) : (
                            safeCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Service Type</Label>
                        <Select
                          value={service.service_type}
                          onValueChange={(value: any) => updateServiceOffering(index, { service_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Service Name and Descriptions */}
                    <div className="space-y-4">
                      <div>
                        <Label>Service Name</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateServiceOffering(index, { name: e.target.value })}
                          placeholder="e.g., Premium Exterior & Interior Wash"
                        />
                      </div>
                      <div>
                        <Label>Short Description</Label>
                        <Input
                          value={service.short_description || ''}
                          onChange={(e) => updateServiceOffering(index, { short_description: e.target.value })}
                          placeholder="Brief description for listings..."
                        />
                      </div>
                      <div>
                        <Label>Detailed Description</Label>
                        <Textarea
                          rows={3}
                          value={service.description}
                          onChange={(e) => updateServiceOffering(index, { description: e.target.value })}
                          placeholder="Describe this service in detail..."
                        />
                      </div>
                    </div>

                    {/* Vehicle-Specific Pricing */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Car className="w-4 h-4" />
                        <Label className="text-base font-medium">Vehicle-Specific Pricing</Label>
                      </div>
                      <div className="space-y-4">
                        {service.pricing.map((pricing) => {
                          const vehicleType = VEHICLE_TYPES.find(v => v.value === pricing.vehicle_type);
                          return (
                            <div key={pricing.vehicle_type} className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Car className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{vehicleType?.label}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <Label className="text-sm">Pricing Tier</Label>
                                  <Select
                                    value={pricing.pricing_tier}
                                    onValueChange={(value: any) => updateServicePricing(index, pricing.vehicle_type, { pricing_tier: value })}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PRICING_TIERS.map(tier => (
                                        <SelectItem key={tier.value} value={tier.value}>
                                          {tier.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm">Price (KSH)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="h-9"
                                    value={pricing.price}
                                    onChange={(e) => updateServicePricing(index, pricing.vehicle_type, { price: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Discount Price</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="h-9"
                                    value={pricing.discount_price || ''}
                                    onChange={(e) => updateServicePricing(index, pricing.vehicle_type, { discount_price: parseInt(e.target.value) || undefined })}
                                    placeholder="Optional"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Duration (min)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="h-9"
                                    value={pricing.estimated_duration}
                                    onChange={(e) => updateServicePricing(index, pricing.vehicle_type, { estimated_duration: parseInt(e.target.value) || 60 })}
                                    placeholder="60"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Service Add-ons */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <Label className="text-base font-medium">Service Add-ons</Label>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addServiceAddon(index)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Add-on
                        </Button>
                      </div>
                      
                      {service.addons.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
                          <p className="text-sm">No add-ons yet. Click "Add Add-on" to include extra services.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {service.addons.map((addon, addonIndex) => (
                            <div key={addonIndex} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-3">
                                <span className="text-sm font-medium">Add-on {addonIndex + 1}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeServiceAddon(index, addonIndex)}
                                  className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-sm">Name</Label>
                                  <Input
                                    className="h-9"
                                    value={addon.name}
                                    onChange={(e) => updateServiceAddon(index, addonIndex, { name: e.target.value })}
                                    placeholder="e.g., Air Freshener"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Price (KSH)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="h-9"
                                    value={addon.price}
                                    onChange={(e) => updateServiceAddon(index, addonIndex, { price: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="md:col-span-1">
                                  <Label className="text-sm">Description</Label>
                                  <Input
                                    className="h-9"
                                    value={addon.description}
                                    onChange={(e) => updateServiceAddon(index, addonIndex, { description: e.target.value })}
                                    placeholder="Brief description..."
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Service Features */}
                    <div>
                      <Label>Service Features</Label>
                      <div className="mt-2">
                        <Textarea
                          rows={2}
                          value={service.features.join(', ')}
                          onChange={(e) => updateServiceOffering(index, { 
                            features: e.target.value.split(',').map(f => f.trim()).filter(f => f) 
                          })}
                          placeholder="e.g., Eco-friendly products, Hand wash, Wax application (separate with commas)"
                        />
                      </div>
                    </div>

                    {/* Service Requirements */}
                    <div>
                      <Label>Special Requirements</Label>
                      <div className="mt-2">
                        <Textarea
                          rows={2}
                          value={(service.requirements || []).join(', ')}
                          onChange={(e) => updateServiceOffering(index, { 
                            requirements: e.target.value.split(',').map(r => r.trim()).filter(r => r) 
                          })}
                          placeholder="e.g., Access to water, Level parking, Vehicle keys (separate with commas)"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Terms and Conditions */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms_accepted"
                    checked={formData.terms_accepted}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms_accepted: !!checked }))}
                  />
                  <Label htmlFor="terms_accepted" className="text-sm">
                    I accept the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and 
                    agree to comply with SafishaHub's service provider policies.
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="data_consent"
                    checked={formData.data_consent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, data_consent: !!checked }))}
                  />
                  <Label htmlFor="data_consent" className="text-sm">
                    I consent to the processing of my personal and business data for the purpose of 
                    providing car wash services through the SafishaHub platform.
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed || !formData.terms_accepted || !formData.data_consent || isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit Application
              </>
            )}
          </Button>
        )}
      </div>

      {/* Auto-save indicator */}
      {saveDraftMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin" />
          Saving draft...
        </div>
      )}
    </div>
  );
}
