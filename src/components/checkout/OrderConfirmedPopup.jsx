import React from 'react';
import { FaBolt } from 'react-icons/fa';
import '../../assets/styles/checkout/orderconfirmed.css';
import TabbyIcon from '../../assets/images/Footer icons/3.webp';
import TamaraIcon from '../../assets/images/Footer icons/6.webp';
import VisaIcon from '../../assets/images/Footer icons/17.webp';
import MasterIcon from '../../assets/images/Footer icons/16.webp';
import CashIcon from '../../assets/images/Footer icons/13.webp';

const OrderConfirmedPopup = ({
  isOpen,
  onClose,
  onPayNow,
  orderId,
  total = 0,
  isLoading = false,
  paymentMethod = 'cod'
}) => {
  if (!isOpen) return null;

  const discountPercent = 5;
  const discountAmount = Number(total) * 0.05;
  const finalAmount = Number(total) * 0.95;

  const isCOD = paymentMethod === 'cod';

  return (
    <div className="order-confirmed-overlay" onClick={onClose}>
      <div className="order-confirmed-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="order-confirmed-close" onClick={onClose}>
          ×
        </button>

        {/* Success Icon */}
        <div className="order-confirmed-icon-wrapper">
          <div className="order-confirmed-checkmark">✓</div>
        </div>

        {/* Success Message */}
        <h2 className="order-confirmed-title">Your order is confirmed. 🎉</h2>

        {/* COD confirmation info */}
        <div className="cod-confirmation-section" style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <img src={CashIcon} alt="Cash on Delivery" style={{ width: '48px', marginBottom: '8px' }} />
          <p style={{ margin: '8px 0', color: '#1e40af', fontWeight: '500' }}>
            Payment Method: <strong>Cash on Delivery</strong>
          </p>
          <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
            Our delivery agent will collect payment when your order arrives
          </p>
        </div>

        {/* 5% OFF Card Upsell - always show for COD orders */}
        {isCOD && (
          <>
            <div className="order-confirmed-offer" style={{
              background: 'linear-gradient(135deg, #f6fdf6, #e8f5e9)',
              border: '1px solid #c8e6c9',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '14px',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '15px', color: '#1b5e20' }}>
                Get an extra <span style={{ color: '#2e7d32', fontWeight: 800 }}>5% OFF</span> when you pay now by card!
              </p>
              {total > 0 && (
                <div style={{ fontSize: '13px', color: '#555' }}>
                  <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>AED {Number(total).toFixed(2)}</span>
                  <span style={{ color: '#2e7d32', fontWeight: 700, fontSize: '15px' }}>AED {finalAmount.toFixed(2)}</span>
                  <span style={{ color: '#2e7d32', marginLeft: '6px', fontSize: '12px' }}>(-AED {discountAmount.toFixed(2)})</span>
                </div>
              )}
            </div>

            <button
              className="order-confirmed-pay-now"
              onClick={onPayNow}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 0',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 12px rgba(245,158,11,0.35)',
                marginBottom: '10px',
                cursor: 'pointer'
              }}
            >
              {isLoading ? 'Processing...' : (
                <>
                  <FaBolt style={{ color: '#fff', fontSize: '1.2em' }} />
                  PAY NOW
                  <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <img src={MasterIcon} alt="Mastercard" style={{ height: '20px', borderRadius: '3px' }} />
                    <img src={VisaIcon} alt="Visa" style={{ height: '20px', borderRadius: '3px' }} />
                  </span>
                </>
              )}
            </button>
          </>
        )}

        {/* Action Buttons */}
        <div className="order-confirmed-actions">
          <button
            className="order-confirmed-no-thanks"
            onClick={onClose}
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isCOD ? 'CONTINUE TO ORDER TRACKING' : 'NO, THANKS'}
          </button>
        </div>

        {/* Order ID Info */}
        {orderId && (
          <div className="order-confirmed-info">
            <p>Order ID: <strong>#{orderId}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmedPopup;

