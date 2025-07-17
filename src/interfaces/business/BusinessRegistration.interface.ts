// export interface PersonalInformation {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
//   date_of_birth?: string;
//   id_number?: string;
// }

// export interface BusinessDetails {
//   business_name: string;
//   business_description: string;
//   business_type: 'individual' | 'partnership' | 'company' | 'cooperative' | 'Full Service Car Wash' | 'Express Car Wash' | 'Mobile Car Wash';
//   business_license?: string;
//   tax_pin?: string;
//   years_of_experience: number;
//   specializations: string[];
//   website?: string; // Added website field
//   operating_hours?: {
//     monday: { open: string; close: string; closed: boolean };
//     tuesday: { open: string; close: string; closed: boolean };
//     wednesday: { open: string; close: string; closed: boolean };
//     thursday: { open: string; close: string; closed: boolean };
//     friday: { open: string; close: string; closed: boolean };
//     saturday: { open: string; close: string; closed: boolean };
//     sunday: { open: string; close: string; closed: boolean };
//   };
// }

// export interface AddressLocation {
//   address: string;
//   city: string;
//   county: string;
//   postal_code?: string;
//   zip_code?: string;

//   country: string;
//   latitude?: number;
//   longitude?: number;
//   service_areas: string[]; // Areas where services can be provided
// }

// export interface ServicePricing {
//   vehicle_type: string;
//   pricing_tier: 'standard' | 'premium' | 'luxury';
//   price: number;
//   discount_price?: number;
//   estimated_duration: number;
// }

// export interface ServiceAddOn {
//   name: string;
//   description: string;
//   price: number;
//   is_active: boolean;
// }

// export interface ServiceOffering {
//   category_id: string;
//   service_type: 'basic' | 'standard' | 'premium' | 'deluxe';
//   name: string;
//   description: string;
//   short_description?: string;
//   features: string[];
//   requirements?: string[];
//   pricing: ServicePricing[];
//   addons: ServiceAddOn[];
//   image_url?: string;
// }

// export interface BusinessRegistrationData {
//   personal_information: PersonalInformation;
//   business_details: BusinessDetails;
//   address_location: AddressLocation;
//   services_offered: ServiceOffering[];
//   terms_accepted: boolean;
//   data_consent: boolean;
// }

// export interface BusinessRegistrationStep {
//   id: string;
//   title: string;
//   description: string;
//   completed: boolean;
//   current: boolean;
// }

// export interface BusinessRegistrationResponse {
//   id: string;
//   status: 'pending' | 'approved' | 'rejected' | 'under_review';
//   submitted_at: string;
//   reviewed_at?: string;
//   notes?: string;
//   data: BusinessRegistrationData;
// }

// export interface ServiceCategory {
//   id: string;
//   name: string;
//   description: string;
//   icon?: string;
//   active: boolean;
// }

// export interface County {
//   id: string;
//   name: string;
//   code: string;
// }
