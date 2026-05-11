import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { getOrderById } from "../api/woocommerce";
import "../assets/styles/OrderSuccess.css";

const formatPrice = (value) => {
  const amount = Number.parseFloat(value);
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return `AED ${safeAmount.toFixed(2)}`;
};

const getSafeAmount = (value) => {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount : 0;
};

const getFeeDiscountTotal = (feeLines = []) =>
  (Array.isArray(feeLines) ? feeLines : []).reduce((sum, fee) => {
    const feeTotal = getSafeAmount(fee?.total);
    return feeTotal < 0 ? sum + Math.abs(feeTotal) : sum;
  }, 0);

const isFreeGiftItem = (item) =>
  Array.isArray(item?.meta_data) &&
  item.meta_data.some(
    (meta) =>
      meta?.key === '_store1920_free_gift' &&
      String(meta?.value).toLowerCase() === 'true'
  );

const popularSearchTerms = [
  "Mosquito killer machine",
  "Electric mosquito killer",
  "Installment mobile phones",
  "Hair curling iron",
  "Portable Screen",
  "Oral irrigator",
  "Water Flosser",
  "Water tooth flosser",
  "Toothbrush",
  "Oral",
  "Electric toothbrush",
  "Bluetooth headphones",
  "Wireless earphones",
  "Travel kit",
  "Coffee bean grinder",
  "Treadmill",
  "Coffee maker machine",
  "Coffee grinder",
  "Home projector",
  "Candle Machines",
  "Gym equipment",
];

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");
  const isCancelled = queryParams.get("cancelled") === "1";

  const [animate, setAnimate] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();
  
  useEffect(() => {
    // Clear cart only for completed success flow.
    // Keep cart for cancelled payments so users can start a new order with same items.
    if (!isCancelled) {
      clearCart();
    }
  }, [clearCart, isCancelled]);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getOrderById(orderId);
        console.log('📦 Order found:', data);
        console.log('💳 Payment Method:', data?.payment_method);
        console.log('📊 Is Cancelled Param:', isCancelled);
        
        // If cancelled=1 BUT payment method is COD, ignore cancelled and show success
        if (isCancelled && (data?.payment_method === 'cod' || data?.payment_method_title === 'Cash on Delivery')) {
          console.log('✅ COD Order - Ignoring cancelled parameter, showing success');
        } else if (isCancelled) {
          console.log('❌ Non-COD order was cancelled - redirecting to cancel page');
          navigate(`/order-cancel?order_id=${orderId}`, { replace: true });
          setLoading(false);
          return;
        }
        
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, isCancelled, navigate]);

  useEffect(() => {
    if (!orderId) {
      navigate("/", { replace: true });
      return;
    }

    setAnimate(true);

    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, orderId]);

  const handleTrackOrder = () => {
    if (orderId) navigate(`/track-order?order_id=${orderId}`);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    alert('Order ID copied to clipboard!');
  };

  const handlePopularSearchClick = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="order-success-card">
          <div className="loading-spinner">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order || !orderId) {
    return (
      <div className="order-success-container">
        <div className="order-success-card">
          <div className="error-message">Order not found.</div>
        </div>
      </div>
    );
  }

  const freeGiftCount = (order.line_items || []).filter(isFreeGiftItem).length;
  const itemsSubtotal = (order.line_items || []).reduce((sum, item) => {
    if (isFreeGiftItem(item)) return sum;
    return sum + getSafeAmount(item.total);
  }, 0);
  const couponDiscountTotal = getSafeAmount(order.discount_total);
  const feeDiscountTotal = getFeeDiscountTotal(order.fee_lines);
  const discountTotal = couponDiscountTotal + feeDiscountTotal;
  const shippingTotal = getSafeAmount(order.shipping_total);

  // Show cancellation message if order is cancelled (but NOT if it's COD)
  const isCOD = order?.payment_method === 'cod' || order?.payment_method_title === 'Cash on Delivery';
  const expectedCodTotal = itemsSubtotal + shippingTotal;
  const orderTotal = getSafeAmount(order.total);
  const hasAnyDiscount = discountTotal > 0;
  const isLikelyResidualCodUpsellDiscount =
    isCOD &&
    !hasAnyDiscount &&
    orderTotal + 0.01 < expectedCodTotal;
  const displayTotal = isLikelyResidualCodUpsellDiscount ? expectedCodTotal : orderTotal;
  if (isCancelled && !isCOD) {
    return (
      <div className="order-success-container">
        <div className="order-success-card">
          {/* Header Section - Cancelled */}
          <div className="order-header">
            <div className="cancel-icon" style={{ 
              fontSize: '4rem', 
              color: '#e74c3c', 
              marginBottom: '1rem' 
            }}>✕</div>
            <h1 className="thank-you-title" style={{ color: '#e74c3c' }}>Order Cancelled</h1>
            <p className="thank-you-subtitle">Your order has been cancelled.</p>
            
            <button className="order-btn" onClick={() => navigate('/orders')}>
              View Orders
            </button>
          </div>

          {/* Order Info Grid */}
          <div className="order-info-grid">
            <div className="info-item">
              <span className="info-label">Order date:</span>
              <span className="info-value">{new Date(order.date_created).toLocaleDateString('en-GB')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value" style={{ color: '#e74c3c', fontWeight: 'bold' }}>Cancelled</span>
            </div>
            <div className="info-item">
              <span className="info-label">Payment method:</span>
              <span className="info-value">{order.payment_method_title || 'COD'}</span>
            </div>
          </div>

          {/* Cancellation Message */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fee', 
            borderRadius: '8px', 
            marginTop: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: '#c0392b' }}>
              This order has been cancelled. If you have any questions, please contact our support team.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '20px',
            justifyContent: 'center'
          }}>
            <button 
              className="track-order-btn" 
              onClick={() => navigate('/')}
              style={{ backgroundColor: '#3498db' }}
            >
              Continue Shopping
            </button>
            <button 
              className="track-order-btn" 
              onClick={() => navigate('/contact')}
              style={{ backgroundColor: '#95a5a6' }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        {/* Header Section */}
        <div className="order-header">
          <div className="success-icon">✓</div>
          <h1 className="thank-you-title">Thank you</h1>
          <p className="thank-you-subtitle">Thank you. Your order has been received.</p>
          {/* <h3><strong>🌧️ Important Update:</strong></h3>
        <p> <strong>Due to ongoing rainy weather conditions, deliveries may
           experience slight delays. Rest assured, your order is safe and protected</strong>
           </p> */}
          <br /><br />
          <p className="order-number-display">Order no. <strong>#{order.id}</strong></p>
        </div>

          {/* <div
          style={{
            padding: "12px 18px",
            marginBottom: "15px",
            borderRadius: "6px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            color: "#856404",
            fontFamily: "Arial, sans-serif",
          }}
        >
      
          <h3>    ⚠️ 🇦🇪 Holiday Notice:</h3>
        
   
      
          <span style={{ fontSize: "14px", lineHeight: "1.4",  fontWeight: "bold" }}>
          Expect minor delivery delays during UAE National Day celebrations.
          </span>
        </div> */}

        {/* Order Number Section */}
        <div className="order-number-section">
          <h2 className="order-id" onClick={handleCopyOrderId}>
          {order.id}
          </h2>
          <p className="copy-order-text" onClick={handleCopyOrderId}>
            📋 Copy order number
          </p>
        </div>

        {/* Order Details Tabs */}
        <div className="order-tabs">
          <button className="tab-btn active">Order details</button>
        </div>

        {/* Order Info Grid */}
        <div className="order-info-grid">
          <div className="info-item">
            <span className="info-label">Order no.:</span>
            <span className="info-value">{order.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Order date:</span>
            <span className="info-value">{new Date(order.date_created).toLocaleDateString('en-GB')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total:</span>
            <span className="info-value">{formatPrice(displayTotal)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Payment method:</span>
            <span className="info-value">{order.payment_method_title || 'COD'}</span>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="order-summary-section">
          <button className="order-summary-btn">Order summary</button>
        </div>

        {/* Products Table */}
        <div className="products-table">
          <div className="table-header">
            <span className="product-header">Product</span>
            <span className="total-header">Total</span>
          </div>
          
          {order.line_items.map((item) => {
            const isGift = isFreeGiftItem(item);
            return (
            <div key={item.id} className="table-row">
              <div className="product-info">
                <div className="product-image">
                  {item.image?.src ? (
                    <img src={item.image.src} alt={item.name} />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      No Image
                    </div>
                  )}
                </div>
                <div className="product-details">
                  <div className="product-name">
                    [{item.product_id}] {item.name}
                    {isGift && <span className="gift-pill">FREE GIFT</span>}
                  </div>
                  <div className="product-quantity">× {item.quantity}{isGift ? ' (promotional item)' : ''}</div>
                </div>
              </div>
              <div className={`product-total ${isGift ? 'product-total-free' : ''}`}>
                {isGift ? 'FREE' : formatPrice(item.total)}
              </div>
            </div>
          );})}

          {/* Summary Section */}
          <div className="order-summary-details">
            <div className="summary-row">
              <span className="summary-label">Items</span>
              <span className="summary-value">{formatPrice(itemsSubtotal)}</span>
            </div>

            {freeGiftCount > 0 && (
              <div className="summary-row">
                <span className="summary-label">Free Gift{freeGiftCount > 1 ? 's' : ''} ({freeGiftCount})</span>
                <span className="summary-value summary-free-value">FREE</span>
              </div>
            )}
            
            <div className="summary-row">
              <span className="summary-label">Discount</span>
              <span className="summary-value">{discountTotal > 0 ? `-AED ${discountTotal.toFixed(2)}` : 'AED 0.00'}</span>
            </div>
            
            {order.shipping_total && parseFloat(order.shipping_total) > 0 && (
              <div className="summary-row">
                <span className="summary-label">Shipping & handling</span>
                <span className="summary-value">{formatPrice(order.shipping_total)}</span>
              </div>
            )}
            
            <div className="summary-row total-row">
              <span className="summary-label">Total</span>
              <span className="summary-value">{formatPrice(displayTotal)}</span>
            </div>
          </div>
        </div>

        {/* Track Order Button */}
        <div className="track-order-section">
          <button className="track-order-btn" onClick={handleTrackOrder}>
            Track Your Order
          </button>
        </div>

        {/* Note for guests */}
        {!user && (
          <div className="guest-note">
            <p>Note: Guests can only track their order. Updates will be sent via WhatsApp.</p>
          </div>
        )}

        {/* Popular Search Terms */}
        <div className="popular-search-section">
          <h3>Most popular search words</h3>
          <div className="search-tags">
            {popularSearchTerms.map((term) => (
              <button
                key={term}
                type="button"
                className="search-tag"
                onClick={() => handlePopularSearchClick(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
