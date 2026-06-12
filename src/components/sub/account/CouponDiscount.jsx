
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import SignInModal from '../SignInModal';
import axios from 'axios';

export default function CouponDiscount({ onApplyCoupon }) {
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState('');
  const [discountData, setDiscountData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleApplyCoupon = async () => {
    setLoading(true);
    setMessage('');
    setDiscountData(null);
    setIsValid(false);
    try {
      const formData = new FormData();
      formData.append('coupon_code', couponCode.trim());
      const response = await axios.post(
        'https://db.store1920.com/wp-admin/admin-ajax.php?action=check_coupon',
        formData
      );
      if (response.data.success) {
        const responseData = response.data.data;
        const data =
          responseData && typeof responseData === 'object'
            ? { ...responseData, code: responseData.code || couponCode.trim() }
            : responseData;
        if (typeof data === 'string' && data.toLowerCase().includes('usage limit')) {
          onApplyCoupon && onApplyCoupon(null);
          setLoading(false);
          setMessage('You have already used this coupon the maximum allowed times.');
          setIsValid(false);
          setDiscountData(null);
          return;
        }
        setDiscountData(data);
        setMessage('Coupon applied!');
        setIsValid(true);
        onApplyCoupon && onApplyCoupon(data);
      } else {
        // Check for usage limit error or other backend error
        let errorMsg = response.data.data || 'Invalid coupon code.';
        if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('usage limit')) {
          errorMsg = 'You have already used this coupon the maximum allowed times.';
        }
        setMessage(errorMsg);
        setIsValid(false);
        setDiscountData(null);
        onApplyCoupon && onApplyCoupon(null);
      }
    } catch (error) {
      console.error(error);
      setMessage('Error checking coupon. Please try again.');
      setIsValid(false);
      onApplyCoupon && onApplyCoupon(null);
    }
    setLoading(false);
  };

  return (
    <div className="coupon-card">
      <div className="coupon-header">Have a Coupon?</div>
      {!user ? (
        <div className="coupon-signin-wrapper">
          {/* <div className="coupon-message error">Please sign in to use a coupon.</div> */}
          <div className="coupon-signin-card">
            <div className="coupon-signin-card-left">
              <div className="coupon-signin-tag-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.41 11.58L12.41 2.58C12.05 2.22 11.55 2 11 2H4C2.9 2 2 2.9 2 4V11C2 11.55 2.22 12.05 2.59 12.42L11.59 21.42C11.95 21.78 12.45 22 13 22C13.55 22 14.05 21.78 14.41 21.41L21.41 14.41C21.78 14.05 22 13.55 22 13C22 12.45 21.77 11.94 21.41 11.58ZM5.5 7C4.67 7 4 6.33 4 5.5C4 4.67 4.67 4 5.5 4C6.33 4 7 4.67 7 5.5C7 6.33 6.33 7 5.5 7Z" fill="#ff6207"/>
                </svg>
              </div>
              <div className="coupon-signin-card-info">
                <span className="coupon-signin-card-title">Have a Coupon Code?</span>
                <span className="coupon-signin-card-sub">Sign in to apply discounts</span>
              </div>
            </div>
            <button className="coupon-signin-card-btn" onClick={() => setShowSignInModal(true)}>
              Sign In
            </button>
          </div>
          {showSignInModal && (
            <div className="coupon-signin-modal-overlay">
              <div className="coupon-signin-modal">
                <SignInModal isOpen={true} onClose={() => setShowSignInModal(false)} onLoginSuccess={() => setShowSignInModal(false)} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
                <style jsx>{`
                  .coupon-signin-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                  }
                  .coupon-signin-card {
                    margin-top: 10px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    background: #fff;
                    border: 1.5px solid #ffe0cc;
                    border-radius: 12px;
                    padding: 12px 14px;
                    box-shadow: 0 2px 8px rgba(255,98,7,0.07);
                  }
                  .coupon-signin-card-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                    min-width: 0;
                  }
                  .coupon-signin-tag-icon {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 38px;
                    height: 38px;
                    background: #fff4ee;
                    border-radius: 10px;
                  }
                  .coupon-signin-card-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                  }
                  .coupon-signin-card-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1a1a1a;
                    white-space: nowrap;
                  }
                  .coupon-signin-card-sub {
                    font-size: 11px;
                    color: #888;
                    white-space: nowrap;
                  }
                  .coupon-signin-card-btn {
                    flex-shrink: 0;
                    padding: 8px 18px;
                    border-radius: 8px;
                    border: none;
                    background: #ff6207;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.15s, transform 0.15s;
                    white-space: nowrap;
                  }
                  .coupon-signin-card-btn:hover {
                    background: #e0550a;
                    transform: translateY(-1px);
                  }
                  .coupon-signin-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0,0,0,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                  }
                  .coupon-signin-modal {
                    background: #fff;
                    border-radius: 18px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
                    padding: 32px 24px 24px 24px;
                    min-width: 320px;
                    max-width: 95vw;
                  }
                `}</style>
          <div className="coupon-row">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
              disabled={loading}
              className={`coupon-input ${isValid ? 'valid' : ''}`}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={loading}
              className="coupon-button"
            >
              {loading ? 'Checking...' : 'Apply'}
            </button>
          </div>
          {message && (
            <div className={`coupon-message ${isValid ? 'success' : 'error'}`}>{message}</div>
          )}
          {discountData && isValid && (
            <div className="coupon-discount">
              {discountData.discount_type === 'percent'
                ? `${discountData.amount}% OFF`
                : `AED ${discountData.amount} OFF`}
            </div>
          )}
        </>
      )}
      <style jsx>{`
        .coupon-card {
          background: none;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
          border: none;
          font-family: 'Montserrat', sans-serif;
          max-width: 100%;
        }

        .coupon-header {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #333;
        }

        .coupon-signin-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .coupon-signin-card {
          margin-top: 10px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: #fff;
          border: 1.5px solid #ffe0cc;
          border-radius: 12px;
          padding: 12px 14px;
          box-shadow: 0 2px 8px rgba(255,98,7,0.07);
        }

        .coupon-signin-card-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .coupon-signin-tag-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: #fff4ee;
          border-radius: 10px;
        }

        .coupon-signin-card-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .coupon-signin-card-title {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
          white-space: nowrap;
        }

        .coupon-signin-card-sub {
          font-size: 11px;
          color: #888;
          white-space: nowrap;
        }

        .coupon-signin-card-btn {
          flex-shrink: 0;
          padding: 8px 18px;
          border-radius: 8px;
          border: none;
          background: #ff6207;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          white-space: nowrap;
        }

        .coupon-signin-card-btn:hover {
          background: #e0550a;
          transform: translateY(-1px);
        }

        .coupon-signin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .coupon-signin-modal {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          padding: 32px 24px 24px 24px;
          min-width: 320px;
          max-width: 95vw;
        }

        .coupon-row {
          display: flex;
          gap: 8px;
          align-items: center;
          padding-right: 6px; /* ✅ spacing from right border */
        }

        .coupon-input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid #ddd;
          font-size: 14px;
          background: #fdfdfd;
          transition: all 0.3s;
        }

        .coupon-input:focus {
          outline: none;
          border-color: #ff5722;
          box-shadow: 0 0 8px rgba(255, 87, 34, 0.3);
        }

        .coupon-input.valid {
          border-color: #4caf50;
          box-shadow: 0 0 6px rgba(76, 175, 80, 0.3);
        }

        .coupon-button {
          padding: 12px 18px;
          border-radius: 14px;
          border: none;
          font-weight: 600;
          font-size: 14px;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(90deg, #ff9800, #ff5722);
          transition: all 0.3s;
          white-space: nowrap;
        }

        .coupon-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 87, 34, 0.4);
        }

        .coupon-button:disabled {
          background: #ffb74d66;
          cursor: not-allowed;
        }

        .coupon-message {
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
        }

        .coupon-message.success {
          color: #155724;
          background: #d4edda;
          border: 1px solid #c3e6cb;
        }

        .coupon-message.error {
          color: #721c24;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }

        .coupon-discount {
          margin-top: 12px;
          padding: 12px;
          border-radius: 16px;
          text-align: center;
          font-weight: 700;
          font-size: 15px;
          color: #006064;
          background: linear-gradient(90deg, #b2ebf2, #e0f7fa);
          border: 1px solid #00acc1;
        }

        @media (max-width: 480px) {
          .coupon-signin-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .coupon-signin-card-btn {
            width: 100%;
          }

          .coupon-row {
            flex-direction: row;
          }

          .coupon-input {
            width: 100%;
          }

          .coupon-card {
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
}
