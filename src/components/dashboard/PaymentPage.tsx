import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { getMyPayments, getPaymentReceipt } from "@/services/payment.service";
import { bookingsService } from "@/services/bookings.service";
import type { Payment } from "@/interfaces/payment/Payment.interface";

// ...existing code...

export function PaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [bookingSummaries, setBookingSummaries] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getMyPayments();
        setPayments(data);
        // Fetch booking summaries for each payment
        const summaries: Record<string, any> = {};
        for (const payment of data) {
          try {
            const booking = await bookingsService.getBookingById(payment.booking_id);
            summaries[payment.id] = booking;
          } catch { }
        }
        setBookingSummaries(summaries);
      } catch (err: any) {
        setError(err.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleDownloadReceipt = async (paymentId: string) => {
    setDownloadingId(paymentId);
    try {
      const blob = await getPaymentReceipt(paymentId);
      const url = window.URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download receipt');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 w-full">
      <h2 className="text-2xl font-bold mb-4">Payment Receipts</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="animate-spin mr-2">🔄</span> Loading payments...
        </div>
      ) : payments.length === 0 ? (
        <div className="py-8 text-gray-600">No payments found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Service Provider</th>
                <th className="text-left p-2">Booking Summary</th>
                <th className="text-left p-2">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const booking = bookingSummaries[p.id];
                return (
                  <tr key={p.id} className="border-b">
                    <td className="p-2">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-2">{new Date(p.created_at).toLocaleTimeString()}</td>
                    <td className="p-2">KES {p.amount}</td>
                    <td className="p-2">{booking?.user?.name || booking?.user?.first_name || '-'}</td>
                    <td className="p-2">{booking?.service?.provider?.name || booking?.service?.provider?.business_name || '-'}</td>
                    <td className="p-2">
                      {booking ? (
                        <div>
                          <div><b>Service:</b> {booking.service?.name}</div>
                          <div><b>Date:</b> {booking.service_date}</div>
                          <div><b>Time:</b> {booking.service_time}</div>
                          <div><b>Vehicle:</b> {booking.vehicle_info?.type} {booking.vehicle_info?.make} {booking.vehicle_info?.model}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant="outline" onClick={() => window.print()}>Print</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(p.id)} disabled={downloadingId === p.id}>
                        {downloadingId === p.id ? 'Downloading...' : 'Download'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

{/* Payment History section removed due to undefined paymentHistory variable. */}

{/* Basic input styling */ }
<style>{`
        .input {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          margin-bottom: 0.5rem;
        }
      `}
</style>