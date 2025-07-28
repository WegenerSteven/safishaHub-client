import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MapPin, Phone, Mail, Calendar, Settings, Shield, Star } from 'lucide-react';
import type { CustomerProfile, ServiceProviderProfile } from '../../interfaces/profile/profile.interface';
import { profileService } from '../../services/profile.service';
import { toast } from 'react-hot-toast';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface CustomerFormData {
  address: string;
  date_of_birth: string;
  preferred_contact_method: string;
  email_notifications: boolean;
  sms_notifications: boolean;
}

interface ServiceProviderFormData {
  business_name: string;
  description: string;
  address: string;
  phone: string;
}

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
  });

  const profileForm = useForm<ProfileFormData>();
  const customerForm = useForm<CustomerFormData>();
  const serviceProviderForm = useForm<ServiceProviderFormData>();

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  // Update customer profile mutation
  const updateCustomerMutation = useMutation({
    mutationFn: profileService.updateCustomerProfile,
    onSuccess: () => {
      toast.success('Customer profile updated successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update customer profile');
    },
  });

  // Update service provider profile mutation
  const updateServiceProviderMutation = useMutation({
    mutationFn: profileService.updateServiceProviderProfile,
    onSuccess: (data) => {
      console.log('Success response:', data);
      toast.success('Service provider profile updated successfully');
      refetch();
    },
    onError: (error: any) => {
      console.log('Success response:', error);
      toast.error(error.message || 'Failed to update service provider profile');
    },
  });

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: () => {
      toast.success('Avatar uploaded successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload avatar');
    },
  });

  // Initialize forms when data is loaded
  useEffect(() => {
    if (profileData) {
      profileForm.reset({
        first_name: profileData.user.first_name,
        last_name: profileData.user.last_name,
        email: profileData.user.email,
        phone: profileData.user.phone || '',
      });

      if (profileData.profileType === 'customer' && profileData.profile) {
        const customerProfile = profileData.profile as CustomerProfile;
        customerForm.reset({
          address: customerProfile.address || '',
          date_of_birth: customerProfile.date_of_birth || '',
          preferred_contact_method: customerProfile.preferred_contact_method || 'email',
          email_notifications: customerProfile.email_notifications,
          sms_notifications: customerProfile.sms_notifications,
        });
      }

      if (profileData.profileType === 'service_provider' && profileData.profile) {
        const serviceProviderProfile = profileData.profile as ServiceProviderProfile;
        serviceProviderForm.reset({
          business_name: serviceProviderProfile.business_name,
          description: serviceProviderProfile.description || '',
          address: serviceProviderProfile.address,
          phone: serviceProviderProfile.phone || '',
        });
      }
    }
  }, [profileData, profileForm, customerForm, serviceProviderForm]);

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitCustomer = (data: CustomerFormData) => {
    updateCustomerMutation.mutate(data);
  };

  const onSubmitServiceProvider = (data: ServiceProviderFormData) => {
    console.log('Service Provider Form Data:', data);
    updateServiceProviderMutation.mutate(data);
  };

  // Handle avatar file selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!profileData) {
    return <div className="flex justify-center items-center h-64">No profile data found</div>;
  }

  const { user, profile, profileType } = profileData;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Avatar className="h-16 w-16">
                  {user.avatar ? (
                    <AvatarImage src={`${import.meta.env.VITE_API_URL}/uploads/avatars/${user.avatar}`} />
                  ) : (
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name} ${user.last_name}`} />
                  )}
                  <AvatarFallback>
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                  onClick={() => document.getElementById('avatarInput')?.click()}
                >
                  <span className="text-white text-xs">Change</span>
                </div>
                <input 
                  type="file" 
                  id="avatarInput" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={profileType === 'customer' ? 'default' : 'secondary'}>
                    {profileType === 'customer' ? 'Customer' : 'Service Provider'}
                  </Badge>
                  {user.email_verified_at && (
                    <Badge variant="success" className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Verified</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Basic Profile</TabsTrigger>
            <TabsTrigger value="role-specific">
              {profileType === 'customer' ? 'Customer Info' : 'Business Info'}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Update your basic profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        {...profileForm.register('first_name', { required: 'First name is required' })}
                      />
                      {profileForm.formState.errors.first_name && (
                        <p className="text-sm text-red-600">{profileForm.formState.errors.first_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        {...profileForm.register('last_name', { required: 'Last name is required' })}
                      />
                      {profileForm.formState.errors.last_name && (
                        <p className="text-sm text-red-600">{profileForm.formState.errors.last_name.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register('email', { required: 'Email is required' })}
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712 345 678"
                      {...profileForm.register('phone')}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full"
                  >
                    {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role-specific Tab */}
          <TabsContent value="role-specific" className="space-y-4">
            {profileType === 'customer' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Customer Information</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your customer preferences and information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Your address"
                        {...customerForm.register('address')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...customerForm.register('date_of_birth')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                      <select
                        id="preferred_contact_method"
                        {...customerForm.register('preferred_contact_method')}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="phone">Phone</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email_notifications">Email Notifications</Label>
                        <Switch
                          id="email_notifications"
                          {...customerForm.register('email_notifications')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms_notifications">SMS Notifications</Label>
                        <Switch
                          id="sms_notifications"
                          {...customerForm.register('sms_notifications')}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={updateCustomerMutation.isPending}
                      className="w-full"
                    >
                      {updateCustomerMutation.isPending ? 'Updating...' : 'Update Customer Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Business Information</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your business details and services 
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={serviceProviderForm.handleSubmit(onSubmitServiceProvider)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        id="business_name"
                        {...serviceProviderForm.register('business_name', { required: 'Business name is required' })}
                      />
                      {serviceProviderForm.formState.errors.business_name && (
                        <p className="text-sm text-red-600">{serviceProviderForm.formState.errors.business_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your business and services"
                        {...serviceProviderForm.register('description')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_address">Business Address</Label>
                      <Textarea
                        id="business_address"
                        placeholder="Your business address"
                        {...serviceProviderForm.register('address', { required: 'Business address is required' })}
                      />
                      {serviceProviderForm.formState.errors.address && (
                        <p className="text-sm text-red-600">{serviceProviderForm.formState.errors.address.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_phone">Business Phone</Label>
                      <Input
                        id="business_phone"
                        type="tel"
                        placeholder="0712 345 678"
                        {...serviceProviderForm.register('phone')}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={updateServiceProviderMutation.isPending}
                      className="w-full"
                    >
                      {updateServiceProviderMutation.isPending ? 'Updating...' : 'Update Business Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Account Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Account Status</span>
                      <Badge variant={user.is_active ? 'success' : 'destructive'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email Verification</span>
                      <Badge variant={user.email_verified_at ? 'success' : 'warning'}>
                        {user.email_verified_at ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Member Since</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {profileType === 'customer' && profile && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Customer Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                        <p className="text-2xl font-bold">{(profile as CustomerProfile).total_bookings}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">KES {(profile as CustomerProfile).total_spent}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Loyalty Tier</p>
                        <Badge variant="secondary">{(profile as CustomerProfile).loyalty_tier}</Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Loyalty Points</p>
                        <p className="text-2xl font-bold">{(profile as CustomerProfile).loyalty_points}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {profileType === 'service_provider' && profile && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Business Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Services</p>
                        <p className="text-2xl font-bold">{(profile as ServiceProviderProfile).total_services}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <p className="text-2xl font-bold">{(profile as ServiceProviderProfile).rating}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Verification</p>
                        <Badge variant={(profile as ServiceProviderProfile).is_verified ? 'success' : 'warning'}>
                          {(profile as ServiceProviderProfile).is_verified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
