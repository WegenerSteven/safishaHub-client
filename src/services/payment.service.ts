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
  const response = await apiService.post('payments/verify', { reference, bookingId, amount });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: any }).data;
  }
  throw new Error("Invalid response from payment verification");
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