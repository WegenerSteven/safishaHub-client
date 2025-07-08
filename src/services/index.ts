import { ServicesService } from './services.service';
import { BookingsService } from './bookings.service';

export { authService } from './auth.service';

// Create service instances
export const servicesService = new ServicesService();
export const bookingsService = new BookingsService();
