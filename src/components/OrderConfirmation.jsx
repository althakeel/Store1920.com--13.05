import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrderById } from "../api/woocommerce"; // adjust path
import "../assets/styles/OrderConfirmation.css";

const formatPrice = (value) => {
  const amount = Number.parseFloat(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
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

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get order_id from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    alert('Order ID copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="order-confirmation-container">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    );
  }

  if (!order || !orderId) {
    return (
      <div className="order-confirmation-container">
        <div className="error-message">Order not found.</div>
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
  const isCOD = order?.payment_method === 'cod' || order?.payment_method_title === 'Cash on Delivery';
  const expectedCodTotal = itemsSubtotal + shippingTotal;
  const orderTotal = getSafeAmount(order.total);
  const hasAnyDiscount = discountTotal > 0;
  const isLikelyResidualCodUpsellDiscount =
    isCOD &&
    !hasAnyDiscount &&
    orderTotal + 0.01 < expectedCodTotal;
  const displayTotal = isLikelyResidualCodUpsellDiscount ? expectedCodTotal : orderTotal;

  return (
    <div className="order-confirmation-containe">
      <div className="order-confirmation-card">
        {/* Header Section */}
        <div className="order-header">
          <div className="success-icon">✓</div>
          <h1 className="thank-you-title">Thank you</h1>
          <p className="thank-you-subtitle">Thank you. Your order has been received.ddd</p>
          
          <button className="order-btn" onClick={() => navigate('/orders')}>
            Order no.
          </button>
        </div>

        {/* Order Number Section */}
        <div className="order-number-section">
          <h2 className="order-id" onClick={handleCopyOrderId} style={{ cursor: 'pointer' }}>
            #S{order.id}
          </h2>
          <p className="copy-order-text" onClick={handleCopyOrderId}>
            📋 Copy order number
          </p>
        </div>

        {/* Order Details Button */}
        <div className="order-details-section">
          <button className="order-details-btn">Order details</button>
        </div>

        {/* Order Info Grid */}
        <div className="order-info-grid">
          <div className="info-item">
            <span className="info-label">Order no.</span>
            <span className="info-value">S{order.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Order date</span>
            <span className="info-value">{new Date(order.date_created).toLocaleDateString('en-GB')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total</span>
            <span className="info-value">{formatPrice(displayTotal)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Payment method</span>
            <span className="info-value">{order.payment_method_title || 'COD'}</span>
          </div>
        </div>

        {/* Order Summary Button */}
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

        {/* Popular Search Terms */}
        <div className="popular-search-section">
          <h3>Most popular search words</h3>
          <div className="search-tags">
            <span className="search-tag">Mosquito killer machine</span>
            <span className="search-tag">Electric mosquito killer</span>
            <span className="search-tag">Installment mobile phones</span>
            <span className="search-tag">Hair curling iron</span>
            <span className="search-tag">Portable Screen</span>
            <span className="search-tag">Oral irrigator</span>
            <span className="search-tag">Water Flosser</span>
            <span className="search-tag">Water tooth flosser</span>
            <span className="search-tag">Toothbrush</span>
            <span className="search-tag">Oral</span>
            <span className="search-tag">Electric toothbrush</span>
            <span className="search-tag">Bluetooth headphones</span>
            <span className="search-tag">Wireless earphones</span>
            <span className="search-tag">Travel kit</span>
            <span className="search-tag">Coffee bean grinder</span>
            <span className="search-tag">Treadmill</span>
            <span className="search-tag">Coffee maker machine</span>
            <span className="search-tag">Coffee grinder</span>
            <span className="search-tag">Home projector</span>
            <span className="search-tag">Candle Machines</span>
            <span className="search-tag">Gym equipment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
