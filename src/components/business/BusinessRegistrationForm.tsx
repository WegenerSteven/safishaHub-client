import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { businessService } from '@/services';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

// Utility to upload business image and return its URL
async function uploadBusinessImage(file: File): Promise<string> {

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/business/upload-image', {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  // Assume backend returns { url: string }
  return data.url;
}

// Form validation schema (matches backend DTO)
const formSchema = z.object({
  name: z.string().min(2, { message: 'Business name must be at least 2 characters.' }),
  type: z.string().min(2, { message: 'Business type is required.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  business_address: z.string().min(5, { message: 'Address is required.' }),
  city: z.string().min(2, { message: 'City is required.' }),
  state: z.string().min(2, { message: 'State is required.' }),
  zip_code: z.string().min(5, { message: 'Valid ZIP code is required.' }),
  phone: z.string().min(10, { message: 'Valid phone number is required.' }),
  email: z.string().email({ message: 'Valid email address is required.' }),
  image: z.string().url({ message: 'Image must be a valid URL.' }).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export function BusinessRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: '',
      description: '',
      business_address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      image: '',
    },
  });

  // Create business mutation
  const createBusinessMutation = useMutation({
    mutationFn: (data: FormValues) => {
      // Remove empty image
      const payload: any = { ...data };
      if (!payload.image) delete payload.image;
      // Remove operating_hours if present
      delete payload.operating_hours;
      return businessService.createBusiness(payload);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['my-business'], data);
      toast.success('Business registered successfully!');
      navigate({ to: '/dashboard/services/manage' });
    },
    onError: (error: any, variables) => {
      let errorMsg = 'Failed to register business.';
      if (error?.response?.data?.message) {
        errorMsg += `\nServer: ${error.response.data.message}`;
      } else if (error?.message) {
        errorMsg += `\n${error.message}`;
      }
      // Show payload for debugging
      errorMsg += `\nPayload: ${JSON.stringify(variables, null, 2)}`;
      toast.error(errorMsg);
      // Also log full error to console for developer
      console.error('Business registration error:', error);
      if (error?.response) {
        console.error('Backend response:', error.response);
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    createBusinessMutation.mutate(data);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Business Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Full Service Car Wash, Express Car Wash" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your business, services offered, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>business address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@yourbusiness.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            {/* Business Image Upload */}
            <div className="mb-4">
              <FormLabel>Business Image (Optional)</FormLabel>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    form.setValue('image', ''); // reset first
                    const url = await uploadBusinessImage(file);
                    form.setValue('image', url, { shouldValidate: true });
                    toast.success('Image uploaded successfully!');
                  } catch (err) {
                    toast.error('Failed to upload image');
                  }
                }}
                className="block mt-2"
              />
              {/* Show preview if image is set */}
              {form.watch('image') && (
                <div className="mt-2">
                  <img
                    src={form.watch('image')}
                    alt="Business Preview"
                    className="h-24 rounded border"
                  />
                </div>
              )}
              <FormMessage />
            </div>



            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Business'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
