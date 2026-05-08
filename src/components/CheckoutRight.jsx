// src/components/checkout/CheckoutRight.jsx
import React, { useState, useEffect } from 'react';
import '../assets/styles/checkout/CheckoutRight.css';
import TrustSection from './checkout/TrustSection';
import CouponDiscount from './sub/account/CouponDiscount';
import CoinBalance from './sub/account/CoinBalace';
import OrderConfirmedPopup from './checkout/OrderConfirmedPopup';
import PaymentMethodSelector from './checkout/PaymentMethodSelector';
import Tabby from '../assets/images/Footer icons/3.webp'
import Tamara from '../assets/images/Footer icons/6.webp'
import { cartHasDynamicProducts, getCartItemDisplayName } from '../utils/staticProductCart';

const DELIVERY_FEE = 13;

// -----------------------------
// Alert Component
// -----------------------------
function Alert({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  const colors = { info: '#2f86eb', success: '#28a745', error: '#dc3545' };

  return (
    <div
      style={{
        padding: '12px 20px',
        marginBottom: '20px',
        backgroundColor: colors[type] || colors.info,
        color: '#fff',
        borderRadius: '4px',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
      role="alert"
    >
      {message}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          right: '12px',
          top: '12px',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
}

// -----------------------------
// Utility: parse price safely
// -----------------------------
const parsePrice = (raw) => {
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.price ?? raw.regular_price ?? raw.sale_price ?? 0;
  }
  const cleaned = String(raw).replace(/,/g, '').replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

// -----------------------------
// CheckoutRight Component
// -----------------------------
export default function CheckoutRight({ cartItems, formData, createOrder, clearCart, orderId, showForm = false, discount, setDiscount, coinDiscount, setCoinDiscount }) {
  const [alert, setAlert] = useState({ message: '', type: 'info' });
  const [hoverMessage, setHoverMessage] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showOrderConfirmed, setShowOrderConfirmed] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState(0);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const showAlert = (message, type = 'info') => setAlert({ message, type });

  const itemsTotal = cartItems.reduce((acc, item) => {
    const price = parsePrice(item.prices?.price ?? item.price);
    const quantity = parseInt(item.quantity, 10) || 1;
    return acc + price * quantity;
  }, 0);

  // Cap total discount to itemsTotal to prevent negative totals
  const totalDiscount = Math.min(discount + coinDiscount, itemsTotal);
  const subtotal = Math.max(0, itemsTotal - totalDiscount);
  const hasDynamicProducts = cartHasDynamicProducts(cartItems);
  const deliveryFee = subtotal > 0 && subtotal < 100 && hasDynamicProducts ? DELIVERY_FEE : 0;
  const totalWithDelivery = Math.max(0, subtotal + deliveryFee); // Ensure total never goes below zero
  const amountToSend = Number(totalWithDelivery.toFixed(2));
  const hasCartItems = cartItems.some((item) => (parseInt(item.quantity, 10) || 0) > 0);
  const isAddressFormOpen = !!(showForm || formData?.addressModalOpen);

  const requiredFields = [
    'first_name',
    'email',
    'phone_number',
    'street',
    'city',
    'country',
  ];
  const shippingOrBilling = formData.shipping || formData.billing || {};
  const isAddressComplete = requiredFields.every((f) => shippingOrBilling[f]?.trim());
  const canPlaceOrder = isAddressComplete && hasCartItems;

  // Capture order items
  const captureOrderItems = async (orderId, cartItems, customer) => {
    const items = cartItems.map((item) => {
      const displayName = getCartItemDisplayName(item);

      return {
        id: item.wooId || item.id || 0,
        name: displayName,
        display_name: displayName,
        bundle_type: item.bundleType || '',
        price: parseFloat(item.prices?.price ?? item.price ?? 0),
        quantity: parseInt(item.quantity, 10) || 1,
      };
    });

    await fetch('https://db.store1920.com/wp-json/custom/v1/capture-order-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        customer: {
          first_name: customer.first_name,
          email: customer.email,
          phone_number: customer.phone_number,
        },
        items,
      }),
    });
  };

  // -----------------------------
  // Place Order
  // -----------------------------
  const handlePlaceOrder = async () => {
    if (!hasCartItems) return showAlert('Your cart is empty.', 'error');
    if (!isAddressComplete) return showAlert('Please fill all required address fields.', 'error');
    if (!formData.paymentMethod) return showAlert('Select a payment method', 'error');
    setIsPlacingOrder(true);

    try {
   let id = orderId;

if (!id) {
  const res = await createOrder();

  // handle all possible shapes
  if (typeof res === 'number') {
    id = res;
  } else if (res?.id) {
    id = res.id;
  } else if (res?.order_id) {
    id = res.order_id;
  } else {
    console.error("createOrder() returned:", res);
    throw new Error("Missing order");
  }
}

const orderIdValue = id;

await captureOrderItems(orderIdValue, cartItems, shippingOrBilling);

      // COD - Show order confirmed popup instead of redirecting
      if (formData.paymentMethod === 'cod') {
        clearCart();
        setConfirmedOrderId(id.id || id);
        setConfirmedOrderTotal(amountToSend); // Store the order total
        setShowOrderConfirmed(true);
        setIsPlacingOrder(false);
        return;
      }
if (formData.paymentMethod === 'wallet') {

  // if (Number(formData.walletBalance) < Number(amountToSend)) {
  //   throw new Error(
  //     `Insufficient wallet balance. Required AED ${amountToSend.toFixed(2)}`
  //   );
  // }

  const res = await fetch(
    "https://db.store1920.com/wp-json/custom/v3/pay-with-wallet",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  order_id: orderIdValue,
}),
    }
  );

  const data = await res.json();

console.log("✅ Wallet Payment Response =>", data);
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Wallet payment failed");
  }

  clearCart();
 window.location.href = `/order-success?order_id=${orderIdValue}`;
  return;
}






      // ✅ STRIPE FLOW
      if (formData.paymentMethod === 'stripe') {
        const normalized = {
          first_name: shippingOrBilling.first_name || 'First',
          email: shippingOrBilling.email || 'customer@example.com',
        };

        const payload = {
          amount: amountToSend,
          order_id: id.id || id,
          billing: normalized,
          saved_card_hint: formData.selectedSavedCardHint || null,
          selected_saved_card_id: formData.selectedSavedCardId || null,
          frontend_success: window.location.origin + '/order-success',
        };

        try {
          const res = await fetch('https://db.store1920.com/wp-json/custom/v3/stripe-direct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          console.log('✅ Stripe Session =>', data);
          if (!res.ok || !data.checkout_url) {
            throw new Error(data.error || 'Failed to start Stripe session.');
          }
          window.location.href = data.checkout_url;
          return;
        } catch (err) {
          console.error('❌ STRIPE FETCH ERROR:', err);
          showAlert(err.message || 'Failed to initiate Stripe payment.', 'error');
        }
      }

      if (formData.paymentMethod === 'tabby') {
  // Construct full phone number from prefix and number
        const phone = shippingOrBilling.phone_number || "";
        const fullPhone = `+971${phone}`;

  const normalized = {
    first_name: shippingOrBilling.first_name || 'First',
    email:      shippingOrBilling.email      || 'customer@example.com',
    phone_number: fullPhone
  };

  const payload = {
    amount: amountToSend,
    order_id: id.id || id,
    billing: normalized
  };

  try {
    const res = await fetch('https://db.store1920.com/wp-json/custom/v1/tabby-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('✅ Tabby Response =>', data);
    console.log('📋 Tabby Payload Sent =>', payload);

    // Check if response indicates an error or missing checkout_url
    if (!res.ok || !data.checkout_url || data.error || data.message) {
      console.error('❌ Tabby API Error Details:', {
        status: res.status,
        statusText: res.statusText,
        response: data
      });
      
      // Use the actual error message from Tabby's response
      const errorMessage = data.error || data.message || 'Failed to start Tabby session.';
      throw new Error(errorMessage);
    }

    window.location.href = data.checkout_url;
    return;
  } catch (err) {
    console.error('❌ TABBY ERROR:', err);
    showAlert(err.message || 'Failed to initiate Tabby payment.', 'error');
  }
      }
      if (formData.paymentMethod === 'tamara') {
        const payload = {
          amount: amountToSend,
          order_id: id.id || id,
          billing: shippingOrBilling,
        };
        const res = await fetch('https://db.store1920.com/wp-json/custom/v1/tamara-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          console.error('Tamara error:', data);
        }
      }



      // ✅ PAYMOB / TABBY / TAMARA / CARD FLOW
      if (['paymob', 'card'].includes(formData.paymentMethod)) {
        const normalized = {
          first_name: shippingOrBilling.first_name?.trim() || 'First',
          email:
            shippingOrBilling.email?.trim() ||
            formData.billing?.email ||
            'customer@example.com',
          phone_number: shippingOrBilling.phone_number?.startsWith('+')
            ? shippingOrBilling.phone_number
            : `+${shippingOrBilling.phone_number || '971501234567'}`,
          street: shippingOrBilling.street?.trim() || '',
          city: shippingOrBilling.city?.trim() || 'Dubai',
          country: 'AE',
        };

        const payload = {
          amount: amountToSend,
          order_id: id.id || id,
          billing: normalized,
          shipping: normalized,
          billingSameAsShipping: true,
          saved_card_hint: formData.selectedSavedCardHint || null,
          selected_saved_card_id: formData.selectedSavedCardId || null,
          items: [
            {
              name: `Order ${id.id || id}`,
              amount: amountToSend,
              quantity: 1,
              description: 'Order from store1920.com',
            },
          ],
          provider: formData.paymentMethod,
        };

        try {
          const res = await fetch('https://db.store1920.com/wp-json/custom/v3/stripe-direct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          console.log('✅ Paymob Response =>', data);

          if (!res.ok) throw new Error(data.message || 'Failed to initiate payment.');
          if (!data.checkout_url && !data.payment_url)
            throw new Error('Paymob checkout URL missing.');
          window.location.href = data.checkout_url || data.payment_url;
          return;
        } catch (err) {
          console.error('❌ PAYMOB FETCH ERROR:', err);
          showAlert(err.message || 'Failed to initiate Paymob payment.', 'error');
        }
      }
    } catch (err) {
      console.error('❌ ORDER ERROR:', err);
      showAlert(err.message || 'Failed to place order.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  
  // -----------------------------
  // UI helpers
  // -----------------------------
  const getButtonStyle = () => {
    return {
      color: '#ffffff',
      backgroundColor: '#f55c00',
      borderRadius: '8px',
      border: 'none',
      fontWeight: 700,
      fontSize: '15px',
      letterSpacing: '0.2px',
      padding: '15px 20px',
      cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s ease',
      boxShadow: '0 2px 8px rgba(245, 92, 0, 0.28)',
    };
  };

  // Handle "Pay Now" from order confirmed popup - go directly to card payment
  const handlePayNowFromConfirmation = () => {
    setShowOrderConfirmed(false);
    handleSelectPaymentMethod('card', confirmedOrderTotal * 0.95, confirmedOrderId);
  };

  // Handle close order confirmed popup
  const handleCloseOrderConfirmed = () => {
    setShowOrderConfirmed(false);
    console.log('✅ COD Order Confirmed - Redirecting to success page');
    // For COD orders, go directly to success page
    window.location.href = `/order-success?order_id=${confirmedOrderId}`;
  };

  // Handle payment method selection from selector
  const handleSelectPaymentMethod = async (method, amount, orderId) => {
    setShowPaymentSelector(false);
    
    // The amount passed already includes the 5% discount from the selector
    // No need to apply discount again - use it as is
    const finalAmount = amount;
    
    // Format data for payment processing
    const shippingOrBilling = formData.shipping || formData.billing || {};
    const normalized = {
      first_name: shippingOrBilling.first_name?.trim() || 'First',
      email: shippingOrBilling.email?.trim() || 'customer@example.com',
      phone_number: shippingOrBilling.phone_number?.startsWith('+')
        ? shippingOrBilling.phone_number
        : `+${shippingOrBilling.phone_number || '971501234567'}`,
    };

    try {
      // CARD PAYMENT
      if (method === 'card') {
        const payload = {
          amount: finalAmount,
          order_id: orderId,
          billing: normalized,
          saved_card_hint: formData.selectedSavedCardHint || null,
          selected_saved_card_id: formData.selectedSavedCardId || null,
          frontend_success: window.location.origin + '/order-success',
        };

        const res = await fetch('https://db.store1920.com/wp-json/custom/v3/stripe-direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.checkout_url) {
          throw new Error(data.error || 'Failed to start payment.');
        }
        window.location.href = data.checkout_url;
        return;
      }

      // TABBY PAYMENT
      if (method === 'tabby') {
        const phone = shippingOrBilling.phone_number || "";
        const fullPhone = `+971${phone}`;

        const payload = {
          amount: finalAmount,
          order_id: orderId,
          billing: { ...normalized, phone_number: fullPhone }
        };

        const res = await fetch('https://db.store1920.com/wp-json/custom/v1/tabby-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.checkout_url) {
          throw new Error(data.error || 'Failed to start Tabby payment.');
        }
        window.location.href = data.checkout_url;
        return;
      }

      // TAMARA PAYMENT
      if (method === 'tamara') {
        const payload = {
          amount: finalAmount,
          order_id: orderId,
          billing: normalized,
        };
        const res = await fetch('https://db.store1920.com/wp-json/custom/v1/tamara-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          throw new Error('Failed to start Tamara payment.');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      showAlert(err.message || 'Failed to process payment.', 'error');
      // Show selector again on error
      setShowPaymentSelector(true);
    }
  };

  const getButtonLabel = () => {
    const labels = {
      cod: 'Cash on Delivery',
      stripe: 'Stripe',
      paymob: 'Paymob',
      card: 'Card',
      tabby: 'Tabby',
      tamara: 'Tamara',
    };

    const defaultLogos = {
      tabby: Tabby,
      tamara: Tamara,
    };

    const method = formData.paymentMethod;
    const hasMethod = Boolean(method);
    const label = hasMethod ? (labels[method] || method) : 'Order';
  const rawLogo = hasMethod ? (defaultLogos[method] || formData.paymentMethodLogo || null) : null;
  const shouldHideLogo = method === 'cod' || method === 'card ' || method === 'wallet';
  const logoUrl = shouldHideLogo ? null : rawLogo;
    const baseText = isPlacingOrder
      ? hasMethod
        ? `Placing Order with ${label}...`
        : 'Placing Order...'
      : hasMethod
        ? `Place Order with ${label}`
        : 'Place Order';

    return <span>{baseText}</span>;
  };

  return (
    <aside className="checkoutRightContainer">
      {/* Order Confirmed Popup */}
      <OrderConfirmedPopup
        isOpen={showOrderConfirmed}
        onClose={handleCloseOrderConfirmed}
        onPayNow={handlePayNowFromConfirmation}
        orderId={confirmedOrderId}
        total={confirmedOrderTotal}
        isLoading={false}
        paymentMethod={formData.paymentMethod}
      />

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        isOpen={showPaymentSelector}
        onClose={() => {
          // When closing payment selector, confirm order as COD
          setShowPaymentSelector(false);
          window.location.href = `/order-success?order_id=${confirmedOrderId}`;
        }}
        onSelectMethod={handleSelectPaymentMethod}
        subtotal={confirmedOrderTotal}
        orderId={confirmedOrderId}
        isLoading={false}
      />

      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: '', type: 'info' })}
      />
      {/* Order Summary: only show when order confirmed popup is NOT open (desktop and mobile) */}
      {!showOrderConfirmed && (
        <>
          <div className="orderSummaryResponsive desktop-only">
            <h2
              style={{
                marginBottom: '12px',
                fontSize: '18px',
                fontWeight: 700,
                color: '#222'
              }}
            >
              Order Summary
            </h2>
            <CouponDiscount onApplyCoupon={data => {
              // data: { amount, discount_type, ... }
              if (!data) {
                setDiscount(0);
                return;
              }
              if (data.discount_type === 'percent') {
                // percent off subtotal
                const percent = parseFloat(data.amount) || 0;
                const itemsTotal = cartItems.reduce((acc, item) => {
                  const price = parsePrice(item.prices?.price ?? item.price);
                  const quantity = parseInt(item.quantity, 10) || 1;
                  return acc + price * quantity;
                }, 0);
                setDiscount((itemsTotal * percent) / 100);
              } else {
                setDiscount(parseFloat(data.amount) || 0);
              }
            }} />
            <div className="summaryRowCR" style={{ marginTop: '1rem' }}>
              <span>Subtotal:</span>
              <span>{`AED ${itemsTotal.toFixed(2)}`}</span>
            </div>
            {discount > 0 && (
              <div className="summaryRowCR">
                <span>Coupon Discount:</span>
                <span style={{ color: '#28a745', fontWeight: 600 }}>- AED {discount.toFixed(2)}</span>
              </div>
            )}
            {coinDiscount > 0 && (
              <div className="summaryRowCR">
                <span>Coin Discount:</span>
                <span style={{ color: '#1976d2', fontWeight: 600 }}>- AED {coinDiscount.toFixed(2)}</span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div className="summaryRowCR">
                <span>Delivery Charge:</span>
                <span style={{ fontWeight: 600 }}>AED {deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="summaryRowCR" style={{ marginTop: '1rem' }}>
              <span>Total:</span>
              <strong>{`AED ${totalWithDelivery.toFixed(2)}`}</strong>
            </div>
          </div>
          {/* Mobile order summary (if you have a mobile-only version, add the same !showOrderConfirmed check there) */}
        </>
      )}

      {/* Desktop: normal button */}
      <button
        className="placeOrderBtnCR desktopStickyButton"
        onClick={handlePlaceOrder}
        disabled={isPlacingOrder || !canPlaceOrder}
        style={getButtonStyle()}
      >
        {getButtonLabel()}
      </button>

      {/* Mobile: sticky button with total, only after address is complete and not editing address/form or order popup */}
      {isAddressComplete && !editingAddress && !isAddressFormOpen && !showOrderConfirmed && (
        <div className="mobileStickyButton">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', color: '#888', fontWeight: 500, marginBottom: '2px' }}>Total</span>
            <span className="mobileSubtotal">AED {totalWithDelivery.toFixed(2)}</span>
          </div>
          <button
            className="placeOrderBtnCR"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || !canPlaceOrder}
            style={getButtonStyle()}
          >
            {getButtonLabel()}
          </button>
        </div>
      )}

      <TrustSection />
    </aside>
  );
}
