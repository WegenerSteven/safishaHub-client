import { ServicesService } from './services.service';
import { BookingsService } from './bookings.service';
import { NotificationsService } from './notifications.service';

export { authService } from './auth.service';
export { serviceProviderDashboardService } from './service-provider-dashboard.service';
export { businessService } from './business.service';

// Create service instances
export const servicesService = new ServicesService();
export const bookingsService = new BookingsService();
export const notificationsService = new NotificationsService();
