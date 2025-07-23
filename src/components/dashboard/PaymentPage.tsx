import { useState } from "react";
import { CreditCard, Smartphone, DollarSign, Bitcoin } from "lucide-react";
import { Button } from "../ui/button";

// Payment methods config
const paymentMethods = [
  { key: "credit", label: "Credit Card", icon: <CreditCard /> },
  { key: "mpesa", label: "M-Pesa", icon: <Smartphone /> },
  { key: "paypal", label: "PayPal", icon: <DollarSign /> },
  { key: "crypto", label: "Crypto", icon: <Bitcoin /> },
];

// Placeholder payment history
const paymentHistory = [
  { id: 1, date: "2025-07-10", amount: 1500, method: "M-Pesa", status: "Paid" },
  { id: 2, date: "2025-06-28", amount: 1200, method: "Credit Card", status: "Paid" },
];

// Payment form for each method
function PaymentForm({ method }: { method: string }) {
  switch (method) {
    case "credit":
      return (
        <div className="mt-4">
          <label className="block mb-1 font-medium">Card Number</label>
          <input className="input" type="text" placeholder="1234 5678 9012 3456" />
          <div className="flex gap-2 mt-2">
            <input className="input" type="text" placeholder="MM/YY" />
            <input className="input" type="text" placeholder="CVV" />
          </div>
        </div>
      );
    case "mpesa":
      return (
        <div className="mt-4">
          <label className="block mb-1 font-medium">M-Pesa Phone Number</label>
          <input className="input" type="text" placeholder="07XXXXXXXX" />
        </div>
      );
    case "paypal":
      return (
        <div className="mt-4">
          <label className="block mb-1 font-medium">PayPal Email</label>
          <input className="input" type="email" placeholder="you@email.com" />
        </div>
      );
    case "crypto":
      return (
        <div className="mt-4">
          <label className="block mb-1 font-medium">Crypto Wallet Address</label>
          <input className="input" type="text" placeholder="Wallet Address" />
        </div>
      );
    default:
      return null;
  }
}

export function PaymentPage() {
  const [selected, setSelected] = useState("credit");
  const [paid, setPaid] = useState(false);

  // Placeholder booking summary
  const booking = {
    service: "Deluxe Car Wash",
    date: "2025-07-24",
    time: "10:00 AM",
    price: 1500,
    vehicle: "Toyota Axio",
  };

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Integrate with backend/payment API
    setPaid(true);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 w-full">
      <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Booking Summary</h3>
        <div className="bg-muted rounded p-4 flex flex-col gap-1">
          <div><b>Service:</b> {booking.service}</div>
          <div><b>Date:</b> {booking.date}</div>
          <div><b>Time:</b> {booking.time}</div>
          <div><b>Vehicle:</b> {booking.vehicle}</div>
          <div><b>Price:</b> KES {booking.price}</div>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Select Payment Method</h3>
        <div className="flex gap-4 flex-wrap">
          {paymentMethods.map((method) => (
            <Button
              key={method.key}
              variant={selected === method.key ? "default" : "outline"}
              onClick={() => setSelected(method.key)}
              className="flex items-center gap-2"
              type="button"
            >
              {method.icon}
              {method.label}
            </Button>
          ))}
        </div>
      </div>
      {!paid ? (
        <form onSubmit={handlePay}>
          <PaymentForm method={selected} />
          <div className="mt-8">
            <Button className="w-full" type="submit">
              Pay Now
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-8 bg-green-100 border border-green-300 rounded p-4 text-green-800">
          <h4 className="font-bold mb-2">Payment Successful!</h4>
          <p>Your booking is confirmed. You can download or print your invoice below.</p>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={() => window.print()}>Print Invoice</Button>
            <Button variant="outline" onClick={() => {/* TODO: Download PDF */}}>Download PDF</Button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="mt-12">
        <h3 className="font-semibold mb-2">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Method</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.date}</td>
                  <td className="p-2">KES {p.amount}</td>
                  <td className="p-2">{p.method}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">
                    <Button size="sm" variant="outline" onClick={() => window.print()}>Print</Button>
                    <Button size="sm" variant="outline" onClick={() => {/* TODO: Download PDF */}}>Download</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic input styling */}
      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}