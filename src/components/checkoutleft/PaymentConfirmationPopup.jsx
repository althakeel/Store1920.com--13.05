import React from 'react';
import '../../assets/styles/checkoutleft/paymentconfirmation.css';
import AmexIcon from '../../assets/images/Footer icons/11.webp';
import MasterCardIcon from '../../assets/images/Footer icons/16.webp';

const PaymentConfirmationPopup = ({
  isOpen,
  onClose,
  onConfirm,
  paymentMethod,
  subtotal,
  discount = 0,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const discountPercentage = 5;
  const discountAmount = subtotal * (discountPercentage / 100);
  const finalAmount = subtotal - discountAmount;

  return (
    <div className="pcp-overlay" onClick={onClose}>
      <div className="pcp-modal" onClick={(e) => e.stopPropagation()}>

        {/* Green top section */}
        <div className="pcp-top">
          <div className="pcp-check">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="white" fillOpacity="0.2"/>
              <path d="M6 12.5L10 16.5L18 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="pcp-title">Your order is confirmed! 🎉</h2>
          <p className="pcp-subtitle">Get an extra <strong>5% OFF</strong> when you pay now!</p>
        </div>

        {/* Price breakdown */}
        <div className="pcp-breakdown">
          <div className="pcp-row">
            <span className="pcp-row-label">Original Amount:</span>
            <span className="pcp-row-value pcp-strikethrough">AED {subtotal.toFixed(2)}</span>
          </div>
          <div className="pcp-row">
            <span className="pcp-row-label pcp-green">5% Discount:</span>
            <span className="pcp-row-value pcp-green">- AED {discountAmount.toFixed(2)}</span>
          </div>
          <div className="pcp-divider" />
          <div className="pcp-row">
            <span className="pcp-total-label">Pay Now:</span>
            <span className="pcp-total-value pcp-green">AED {finalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* PAY NOW button */}
        <button
          className="pcp-pay-btn"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (
            <>
              &#9889; PAY NOW
              <span className="pcp-card-icons">
                <img src={MasterCardIcon} alt="Mastercard" />
                <img src={AmexIcon} alt="Amex" />
              </span>
            </>
          )}
        </button>

        {/* NO THANKS button */}
        <button className="pcp-no-thanks" onClick={onClose} disabled={isLoading}>
          NO, THANKS
        </button>

      </div>
    </div>
  );
};

export default PaymentConfirmationPopup;
