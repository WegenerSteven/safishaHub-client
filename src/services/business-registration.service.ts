import api from './api';
import type { 
  BusinessRegistrationData, 
  BusinessRegistrationResponse,
  ServiceCategory,
  County
} from '../interfaces/business/BusinessRegistration.interface';

export const businessRegistrationService = {
  /**
   * Submit business registration application
   */
  async submitApplication(data: BusinessRegistrationData): Promise<BusinessRegistrationResponse> {
    // Transform the business registration data to match the backend DTO with new business entity structure
    const registrationPayload = {
      // User information (for existing users registering business)
      email: data.personal_information.email,
      password: 'TempPassword123!', 
      first_name: data.personal_information.first_name,
      last_name: data.personal_information.last_name,
      phone: data.personal_information.phone,
      
      // Business information for the new business entity
      business: {
        name: data.business_details.business_name,
        type: data.business_details.business_type || 'Car Wash Service',
        description: data.business_details.business_description,
        address: data.address_location.address,
        city: data.address_location.city,
        state: data.address_location.county, // Map county to state
        postal_code: data.address_location.zip_code,
        phone: data.personal_information.phone, // Use personal phone for business
        email: data.personal_information.email,
        website: data.business_details.website || '',
        license_number: data.business_details.business_license || '',
        tax_id: data.business_details.tax_pin || '',
        latitude: data.address_location.latitude,
        longitude: data.address_location.longitude,
      },
      
      // Operating hours for the BusinessHours entity
      operating_hours: {
        hours: data.business_details.operating_hours || {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        }
      }
      // Note: Services will be created separately after successful registration
    };

    console.log('Submitting registration payload:', registrationPayload);

    try {
      // Updated endpoint to use the business-specific registration endpoint
      const response = await api.post<typeof registrationPayload, BusinessRegistrationResponse>('/businesses/register', registrationPayload);
      console.log('Business registration successful:', response);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  /**
   * Save draft registration data (auto-save functionality) - using localStorage
   */
  async saveDraft(data: Partial<BusinessRegistrationData>): Promise<{ success: boolean }> {
    try {
      localStorage.setItem('business_registration_draft', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.error('Failed to save draft to localStorage:', error);
      return { success: false };
    }
  },

  /**
   * Get draft registration data - from localStorage
   */
  async getDraft(): Promise<Partial<BusinessRegistrationData> | null> {
    try {
      const draftData = localStorage.getItem('business_registration_draft');
      return draftData ? JSON.parse(draftData) : null;
    } catch (error) {
      console.error('Failed to retrieve draft from localStorage:', error);
      return null;
    }
  },

  /**
   * Get available service categories
   */
  async getServiceCategories(): Promise<ServiceCategory[]> {
    const response = await api.get<{success: boolean, data: ServiceCategory[], message: string}>('/services/categories');
    return response.data || [];
  },

  /**
   * Get Kenyan counties
   */
  async getCounties(): Promise<County[]> {
    try {
      const response = await api.get<County[]>('/locations');
      return response;
    } catch (error) {
      // Fallback to hardcoded counties if endpoint doesn't exist
      return [
        { id: '1', name: 'Nairobi', code: 'NRB' },
        { id: '2', name: 'Mombasa', code: 'MSA' },
        { id: '3', name: 'Kiambu', code: 'KAB' },
        { id: '4', name: 'Nakuru', code: 'NKU' },
        { id: '5', name: 'Machakos', code: 'MCH' },
        { id: '6', name: 'Kajiado', code: 'KJD' },
        { id: '7', name: 'Uasin Gishu', code: 'UGS' }
      ];
    }
  },

  /**
   * Validate business license number
   */
  async validateBusinessLicense(licenseNumber: string): Promise<{ valid: boolean; business_name?: string }> {
    try {
      const response = await api.post<{ license_number: string }, { valid: boolean; business_name?: string }>('/auth/register/service-provider/validate-license', {
        license_number: licenseNumber
      });
      return response;
    } catch (error) {
      // Fallback validation - for demo purposes, consider all licenses valid
      return { 
        valid: true, 
        business_name: `Business for License ${licenseNumber}` 
      };
    }
  },

  /**
   * Get registration status
   */
  async getRegistrationStatus(): Promise<BusinessRegistrationResponse | null> {
    try {
      const response = await api.get<BusinessRegistrationResponse>('/auth/register/service-provider/status');
      return response;
    } catch (error) {
      // Return null if endpoint doesn't exist - user will need to complete registration
      return null;
    }
  },

  /**
   * Get geocoding for address
   */
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
    const response = await api.post<{ address: string }, { latitude: number; longitude: number }>('/locations/geocode', { address });
    return response;
  }
};
