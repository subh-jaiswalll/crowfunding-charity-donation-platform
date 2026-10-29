
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api";
import "./Donation.css";

function Donate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const charityId = searchParams.get("charityId");

  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function loadRazorpay() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  async function handleDonation(event) {
    event.preventDefault();
    setMessage("");

    const donationAmount = Number(amount);

    if (
      !charityId ||
      !Number.isFinite(donationAmount) ||
      donationAmount < 1 ||
      donationAmount > 1000000
    ) {
      setMessage("Enter a valid donation amount and charity.");
      return;
    }

    setLoading(true);

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        setMessage("Unable to load Razorpay Checkout.");
        setLoading(false);
        return;
      }

      // Step 1: Create an order.
      // Backend expects ngoId, not charityId.
      const response = await api.post(
        "/donation/create-order",
        {
          ngoId: Number(charityId),
          amount: donationAmount,
        }
      );

      const order = response.data;

      // Step 2: Configure Razorpay Checkout.
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CrowFunding",
        description: `Donation to ${order.charityName || "Charity"}`,
        order_id: order.orderId,

        // Step 3: Verify payment on the backend.
        handler: async function (paymentResponse) {
          try {
            const verification = await api.post(
              "/donation/verify-payment",
              {
                donationId: order.donationId,
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            setMessage(verification.data.message);

            // Open history again so it fetches fresh records.
            navigate("/donation-history");
          } catch (error) {
            console.error(
              "Payment verification error:",
              error.response?.data || error
            );

            setMessage(
              error.response?.data?.message ||
                "Payment verification failed. Check your donation history."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setMessage(
              "Checkout closed. Your donation may still be pending."
            );
          },
        },

        theme: {
          color: "#087f5b",
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", function (response) {
        setLoading(false);

        setMessage(
          response.error?.description ||
            "Payment failed. Please try again."
        );
      });

      checkout.open();
    } catch (error) {
      console.error(
        "Donation order error:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to start donation."
      );

      setLoading(false);
    }
  }

  return (
    <main className="donation-page">
      <section className="donation-card">
        <h1>Support This Charity</h1>

        <p>
          Your contribution can help make a meaningful difference.
        </p>

        <form onSubmit={handleDonation}>
          <label htmlFor="amount">
            Donation amount (₹)
          </label>

          <div className="amount-options">
            {[100, 500, 1000, 2000].map((value) => (
              <button
                type="button"
                key={value}
                className={
                  Number(amount) === value ? "selected" : ""
                }
                onClick={() => setAmount(String(value))}
              >
                ₹{value}
              </button>
            ))}
          </div>

          <input
            id="amount"
            type="number"
            min="1"
            max="1000000"
            step="1"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="primary-button"
          >
            {loading ? "Processing..." : "Donate Now"}
          </button>
        </form>

        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

export default Donate;
