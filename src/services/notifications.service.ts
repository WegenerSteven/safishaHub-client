import apiService from './api';

export interface NotificationData {
  type: 'booking' | 'payment' | 'message' | 'system';
  title: string;
  message: string;
  recipient_id: string;
  data?: Record<string, any>;
}

export class NotificationsService {
  /**
   * Send a notification to a user
   */
  async sendNotification(notificationData: NotificationData): Promise<any> {
    try {
      return await apiService.post('/notifications', notificationData);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send a booking notification
   */
  async sendBookingNotification(
    recipientId: string, 
    bookingId: string, 
    customerName: string, 
    serviceName: string, 
    bookingDate: string
  ): Promise<any> {
    const notificationData: NotificationData = {
      type: 'booking',
      title: 'New Booking',
      message: `${customerName} has booked your service: ${serviceName} for ${bookingDate}`,
      recipient_id: recipientId,
      data: {
        booking_id: bookingId,
        service_name: serviceName,
        customer_name: customerName,
        booking_date: bookingDate
      }
    };
    
    try {
      return await this.sendNotification(notificationData);
    } catch (error) {
      // Log but don't fail the booking process due to notification issue
      console.error('Failed to send booking notification:', error);
      return null;
    }
  }

  /**
   * Send an SMS notification (if configured)
   */
  async sendSmsNotification(
    phone: string, 
    message: string
  ): Promise<any> {
    try {
      return await apiService.post('/sms/send', { to: phone, message });
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      // Don't throw error to avoid breaking the main flow
      return null;
    }
  }

  /**
   * Send an email notification
   */
  async sendEmailNotification(
    email: string, 
    subject: string, 
    message: string,
    templateData?: Record<string, any>
  ): Promise<any> {
    try {
      return await apiService.post('/email/send', { 
        to: email, 
        subject,
        message,
        template_data: templateData
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // Don't throw error to avoid breaking the main flow
      return null;
    }
  }
}
