import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<"upi" | "cod">("upi");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      if (!orderId) return;
      setLoading(true);
      setError("");
      try {
        const intent = await fetch(apiUrl("/api/payments/intent/"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: Number(orderId) })
        });
        if (!intent.ok) {
          const data = await intent.json().catch(() => ({}));
          setError(data.error || "Failed to create payment intent");
          return;
        }
        const data = await intent.json();
        setPaymentId(Number(data.payment_id));
        setAmount(Number(data.amount));
      } catch (e) {
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [orderId]);

  const handlePay = async () => {
    if (!paymentId) return;
    if (method === "upi" && !upiId.trim()) {
      setError("Please enter a valid UPI ID");
      return;
    }
    setError("");
    try {
      const res = await fetch(apiUrl("/api/payments/confirm/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentId,
          outcome: method === "upi" ? "success" : "cod"
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Payment failed");
        return;
      }
      try {
        localStorage.setItem("milkman:openProfileAfterPay", "1");
      } catch {}
      navigate("/");
    } catch (e) {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg p-8 rounded-3xl border border-slate-200 shadow-lg">
        <h1 className="text-3xl font-serif mb-6 text-slate-900">Payment</h1>
        {loading ? (
          <div className="text-slate-400">Initializing payment...</div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-slate-500 text-sm">Order ID: {orderId}</p>
              <p className="text-xl font-bold mt-1 text-primary">₹{amount}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="method-upi"
                  checked={method === "upi"}
                  onChange={() => setMethod("upi")}
                />
                <label htmlFor="method-upi" className="text-slate-800">UPI</label>
              </div>
              {method === "upi" && (
                <input
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-primary outline-none transition-all"
                  placeholder="your-id@bank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              )}
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="method-cod"
                  checked={method === "cod"}
                  onChange={() => setMethod("cod")}
                />
                <label htmlFor="method-cod" className="text-slate-800">Cash on Delivery</label>
              </div>
              {method === "cod" && (
                <p className="text-xs text-slate-500">Order will remain pending until collected.</p>
              )}
            </div>

            <button
              onClick={handlePay}
              className="w-full py-4 bg-primary text-white rounded-full font-bold hover:opacity-90 transition-all"
            >
              {method === "upi" ? `Pay ₹${amount}` : "Confirm COD"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
