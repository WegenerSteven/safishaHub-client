import apiService from "./api";

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