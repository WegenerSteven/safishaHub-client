import apiService from "./api";
import type { Payment } from "@/interfaces/payment/Payment.interface";

export async function initializePayStackPayment(amount: number, email: string, metadata?: any){
  const response = await apiService.post('/payments/initialize',{
    amount,
    email,
    metadata,
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: any }).data;
  }
  throw new Error("Invalid response from payment initialization");
}

export async function verifyPayStackPayment(reference: string, bookingId: string, amount: number){
  // Debug: Log outgoing request
  console.log('[verifyPayStackPayment] Sending:', { reference, bookingId, amount });

  try{
  const response = await apiService.post('payments/verify', { reference, bookingId, amount });
  // Debug: Log response
  console.log('[verifyPayStackPayment] Response:', response);

  if (response && typeof response === "object") {
    //handle both the new format (with success field) and old format
    if("data" in response){
      return{
        status: 'success',
        data: response.data,
        message: response.message || 'Payment verified successfully'
      };
    }

    return{
      status: 'success',
      data: response,
      message: 'Payment verified sucessfully'
    };
  }
  
  throw new Error("Invalid response from payment verification");
  } catch(error){
    console.error('[verifyPayStackPayment] Error:', error)

    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as any).response === "object" &&
      (error as any).response !== null &&
      "data" in (error as any).response &&
      typeof (error as any).response.data === "object" &&
      (error as any).response.data !== null &&
      (error as any).response.data.response === "Payment already exists for this booking."
    ) {
      console.log('[VerifyPayStackPayment] Payment already exists, treating as success');
      return{
        status: 'success',
        data: null,
        message: 'Payment already processed'
      };
    }

    throw error;
  }
}

export async function getMyPayments(): Promise<Payment[]> {
  const response = await apiService.get<Payment[] | { data: Payment[] }>("/payments/my");
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
    return response.data;
  } 
  throw new Error("Invalid response from payments endpoint");
}

export async function getPaymentReceipt(paymentId: string): Promise<Blob> {
  const response = await apiService.get(`/payments/${paymentId}/receipt`, { responseType: "blob" });
  return response as Blob;
}