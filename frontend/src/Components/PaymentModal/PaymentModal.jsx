import React, { useState } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ totalAmount, onClose, onPaymentSuccess, cartItems, allProducts }) => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Prepare order items
            const orderItems = [];
            for (const itemId in cartItems) {
                if (cartItems[itemId] > 0) {
                    const product = allProducts.find(p => p.id === Number(itemId));
                    if (product) {
                        orderItems.push({
                            productId: product.id,
                            name: product.name,
                            price: product.new_price,
                            quantity: cartItems[itemId],
                            image: product.image
                        });
                    }
                }
            }

            // 2. Create order
            const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/createorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({
                    items: orderItems,
                    totalAmount: totalAmount,
                    paymentMethod: paymentMethod,
                    shippingAddress: shippingAddress
                })
            });

            const orderData = await orderResponse.json();

            if (orderData.success) {
                // 3. Simulate payment processing
                setTimeout(async () => {
                    // 4. Update payment status
                    await fetch(`${process.env.REACT_APP_API_URL}/updatepayment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'auth-token': localStorage.getItem('auth-token')
                        },
                        body: JSON.stringify({
                            orderId: orderData.orderId,
                            paymentStatus: 'completed'
                        })
                    });

                    // 5. Clear cart
                    await fetch(`${process.env.REACT_APP_API_URL}/clearcart`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'auth-token': localStorage.getItem('auth-token')
                        }
                    });

                    setLoading(false);
                    onPaymentSuccess();
                }, 2000);
            }
        } catch (error) {
            setLoading(false);
            alert('Payment failed. Please try again.');
        }
    };


  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
      {/* ... rest of your modal code with shipping address fields ... */}
        <div className="shipping-address">
            <h3>Shipping Address</h3>
            <input type="text" placeholder="Full Name" value={shippingAddress.name} onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})} required />
            <input type="email" placeholder="Email" value={shippingAddress.email} onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})} required />
            <input type="tel" placeholder="Phone Number" value={shippingAddress.phone} onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} required />
            <textarea placeholder="Full Address" value={shippingAddress.address} onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} required />
            <div className="address-row">
                <input type="text" placeholder="City" value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} required />
                <input type="text" placeholder="State" value={shippingAddress.state} onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} required />
                <input type="text" placeholder="Pincode" value={shippingAddress.pincode} onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})} required />
            </div>
        </div>
        <div className="payment-modal-header">
          <h2>Complete Your Payment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="payment-summary">
          <h3>Total Amount: ₹{totalAmount}</h3>
        </div>

        <form onSubmit={handlePayment} className="payment-form">
          <div className="payment-methods">
            <label>
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Credit/Debit Card
            </label>
            <label>
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              UPI
            </label>
            <label>
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="card-details">
              <input
                type="text"
                placeholder="Card Number"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                required
              />
              <div className="card-row">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Cardholder Name"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                required
              />
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="upi-details">
              <input
                type="text"
                placeholder="UPI ID (e.g., name@upi)"
                required
              />
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="cod-message">
              <p>Pay when your order is delivered</p>
            </div>
          )}

          <button type="submit" className="pay-now-btn">
            Pay ₹{totalAmount}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;