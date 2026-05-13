import React, { useEffect, useState } from 'react';
import '../../assets/styles/checkoutleft/paymentmethods.css';
import PaymentConfirmationPopup from './PaymentConfirmationPopup';

import TabbyIcon from '../../assets/images/Footer icons/3.webp';
import TamaraIcon from '../../assets/images/Footer icons/6.webp';
import CashIcon from '../../assets/images/Footer icons/13.webp';
import CardIcon from '../../assets/images/tabby/creditcard.webp';

// Card payment icons
import ApplePayIcon from '../../assets/images/Footer icons/2.webp';
import AmexIcon from '../../assets/images/Footer icons/11.webp';
import GooglePayIcon from '../../assets/images/Footer icons/12.webp';
import MasterCardIcon from '../../assets/images/Footer icons/16.webp';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { buildSavedCardHint, getSavedCardsForUser } from '../../utils/savedCards';

// Safely import staticProducts with fallback
let staticProducts = [];
try {
  const staticProductsModule = require('../../data/staticProducts');
  staticProducts = staticProductsModule.default || staticProductsModule || [];
} catch (error) {
  console.warn('Could not load static products data:', error);
  staticProducts = [];
}

// Tabby credentials
const TABBY_PUBLIC_KEY = 'pk_test_019a4e3b-c868-29ff-1078-04aec08847bf';
const TABBY_MERCHANT_CODE = 'Store1920';

// Tamara credentials
const TAMARA_PUBLIC_KEY = '610bc886-8883-42f4-9f61-4cf0ec45c02e';

const formatAED = (value) => `AED${Number(value || 0).toFixed(2)}`;

const isCodEnabledValue = (value) => {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'yes', 'on'].includes(normalized);
  }
  return false;
};

const getInstallmentAmounts = (amount) => {
  const normalizedAmount = Number(amount) || 0;
  const baseInstallment = Math.floor((normalizedAmount / 4) * 100) / 100;
  const installments = Array.from({ length: 4 }, () => baseInstallment);
  const assignedTotal = baseInstallment * 4;
  installments[3] = Number((normalizedAmount - assignedTotal + baseInstallment).toFixed(2));
  return installments;
};

const PAYMENT_SCHEDULE_LABELS = ['Today', 'In 1 month', 'In 2 months', 'In 3 months'];

const InstallmentOption = ({
  method,
  icon,
  selected,
  disabled = false,
  amount,
  onChange,
}) => {
  const brandName = method === 'tabby' ? 'Tabby.' : 'Tamara:';
  const lineText =
    method === 'tabby'
      ? 'Split into 4 Payments'
      : 'Split in up to 4 payments';
  const installments = getInstallmentAmounts(amount);

  return (
    <div className={`payment-method-item payment-method-item--installment ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
      <input
        type="radio"
        id={method}
        name="payment-method"
        disabled={disabled}
        checked={selected}
        onChange={onChange}
      />
      <label htmlFor={method} className="payment-method-label payment-method-label--installment">
        <div className="temu-pay-block">
          <div className="temu-pay-header">
            <div className="temu-pay-brand-row">
              <img src={icon} alt={method === 'tabby' ? 'Tabby' : 'Tamara'} className="temu-pay-logo" />
              <span className="temu-pay-brand-copy">
                <strong>{brandName}</strong> {lineText}
              </span>
              <span className="temu-pay-info">?</span>
            </div>
            <div className="temu-pay-summary">
              <span className="temu-pay-highlight">Pay {formatAED(installments[0])} today</span> and the rest in 3 interest-free payments
            </div>
          </div>

          <div className={`temu-pay-schedule ${method === 'tamara' ? 'temu-pay-schedule--tamara' : 'temu-pay-schedule--tabby'}`}>
            {installments.map((installmentAmount, index) => (
              <div key={`${method}-${PAYMENT_SCHEDULE_LABELS[index]}`} className="temu-pay-installment">
                <div className="temu-pay-installment-amount">{formatAED(installmentAmount)}</div>
                <div className="temu-pay-installment-label">{PAYMENT_SCHEDULE_LABELS[index]}</div>
                <div className={`temu-pay-installment-bar temu-pay-installment-bar--${method}`} />
              </div>
            ))}
          </div>
        </div>
      </label>
    </div>
  );
};

const PaymentMethods = ({
  selectedMethod,
  selectedSavedCardId = null,
  onMethodSelect,
  subtotal,
  cartItems = [],
  onDiscountChange = null,
}) => {
  const [showCodPopup, setShowCodPopup] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [confirmationMethod, setConfirmationMethod] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [walletBalance, setWalletBalance] = React.useState(null);
  const [walletLoading, setWalletLoading] = React.useState(true);
  const [savedCards, setSavedCards] = useState([]);
  const { user } = useAuth();
  
  // Log cartItems received
  useEffect(() => {
    console.log('📦 PaymentMethods received cartItems:', cartItems);
  }, [cartItems]);
  console.log('Auth user object:', user);
console.log('Auth user ID:', user?.id);


  // Set COD as default if nothing is selected and subtotal > 0
  useEffect(() => {
    if (!selectedMethod && subtotal > 0) {
      onMethodSelect('cod', 'Cash on Delivery', CashIcon);
    }
  }, [selectedMethod, subtotal, onMethodSelect]);

  useEffect(() => {
    setSavedCards(getSavedCardsForUser(user?.id));
  }, [user?.id]);

  const resolvedSelectedSavedCardId =
    selectedSavedCardId || savedCards[0]?.id || null;

  const selectedSavedCard =
    savedCards.find((card) => card.id === resolvedSelectedSavedCardId) || savedCards[0] || null;

  const handlePaymentMethodSelect = (
    methodId,
    methodTitle,
    methodLogo = null,
    extra = {}
  ) => {
    // Manual card selection should always use normal pricing (no COD upsell 5% off).
    if (methodId === 'card') {
      sessionStorage.removeItem('paymentRedirectInitiated');
      sessionStorage.removeItem('paymentStartTime');
      if (onDiscountChange) {
        onDiscountChange(0);
      }
    }

    onMethodSelect(methodId, methodTitle, methodLogo, extra);
  };

  const handleConfirmationClose = () => {
    // Clear flags and discount when user manually closes (clicks "NO THANKS")
    sessionStorage.removeItem('paymentRedirectInitiated');
    sessionStorage.removeItem('paymentStartTime');
    
    // Clear the 5% discount when canceling payment
    if (onDiscountChange) {
      onDiscountChange(0);
      console.log('🗑️ Cleared 5% discount (user clicked NO THANKS)');
    }
    
    setShowPaymentConfirmation(false);
    setConfirmationMethod(null);
  };

  // COD selection should not open any upsell popup.
  const handleCodSelect = () => {
    // Always switch to COD immediately so radio state is consistent
    // even after switching from Tabby/Tamara/Card.
    onMethodSelect('cod', 'Cash on Delivery', CashIcon);

    // Clear any in-progress pay-now redirect flags and discount remnants.
    sessionStorage.removeItem('paymentRedirectInitiated');
    sessionStorage.removeItem('paymentStartTime');
    if (onDiscountChange) {
      onDiscountChange(0);
    }
  };

  const closePopupWithoutClearingFlags = () => {
    // Close popup but keep flags for return detection
    // Used when confirming payment (user will be redirected to Stripe)
    setShowPaymentConfirmation(false);
    setConfirmationMethod(null);
  };

  const handleConfirmationConfirm = () => {
    if (confirmationMethod) {
      onMethodSelect(
        confirmationMethod.id,
        confirmationMethod.title,
        confirmationMethod.logo,
        confirmationMethod.extra || {}
      );
      // Don't clear flags - keep them for return detection from Stripe
      closePopupWithoutClearingFlags();
    }
  };

  const handleSavedCardSelect = (card) => {
    const extra = {
      selectedSavedCardId: card.id,
      selectedSavedCardHint: buildSavedCardHint(card),
    };

    handlePaymentMethodSelect('card', 'Credit/Debit Card', CardIcon, extra);
  };

  // Static product checks
  let staticProductIds = [];
  try {
    staticProductIds = staticProducts.flatMap(product => {
      const ids = [product.id];
      if (product.bundles && Array.isArray(product.bundles)) {
        product.bundles.forEach(bundle => bundle.id && ids.push(bundle.id));
      }
      return ids;
    });
  } catch {
    staticProductIds = [];
  }

  const codRelevantItems = cartItems.filter(item => !item.isGift);
  const getItemLookupId = (item) => Number(item.wooId || item.productId || item.id);

  const hasOnlyStaticProducts =
    codRelevantItems.length > 0 &&
    staticProductIds.length > 0 &&
    codRelevantItems.every(item => staticProductIds.includes(getItemLookupId(item)));

  const hasNonStaticProducts =
    staticProductIds.length > 0 &&
    codRelevantItems.some(item => !staticProductIds.includes(getItemLookupId(item)));

  // Business rule override: enable COD for all products when cart has payable items.
  const allItemsSupportCOD = codRelevantItems.length > 0;
  const isCodAvailableForCart = codRelevantItems.length > 0;

  // Set default payment method: COD if available, otherwise Card
  useEffect(() => {
    if (!selectedMethod && subtotal > 0) {
      if (isCodAvailableForCart) {
        onMethodSelect('cod', 'Cash on Delivery', CashIcon);
      } else {
        onMethodSelect('card', 'Credit/Debit Card', CardIcon);
      }
    }
  }, [selectedMethod, subtotal, onMethodSelect, isCodAvailableForCart]);

  console.log('💳 COD Availability Check:', {
    cartItemCount: cartItems.length,
    codRelevantItemCount: codRelevantItems.length,
    cartItems: cartItems.map(i => ({ id: i.id, name: i.name, cod_available: i.cod_available })),
    allItemsSupportCOD,
    hasOnlyStaticProducts,
    hasNonStaticProducts,
    isCodAvailableForCart
  });

  // ✅ DETECT RETURN FROM PAYMENT PROVIDER AND RESET STATES
  // When user comes back from Stripe/payment page, reset payment popups and method
  // This ensures the original COD price is shown (without any 5% discount)
  useEffect(() => {
    const checkReturnFromPayment = () => {
      const wasPaymentRedirectInitiated = sessionStorage.getItem('paymentRedirectInitiated');
      const paymentStartTime = sessionStorage.getItem('paymentStartTime');
      const now = Date.now();
      
      // If payment redirect was initiated and we still have the timestamp, check if user returned
      if (wasPaymentRedirectInitiated && paymentStartTime) {
        const timeSincePayment = now - parseInt(paymentStartTime, 10);
        
        // If payment was initiated but user is still on card method after 200ms,
        // it likely means they returned from payment provider (without successful redirect)
        if (timeSincePayment > 200) {
          console.log('🔄 Detected return from payment provider - timeSincePayment:', timeSincePayment);
          console.log('💰 Resetting to original COD price (no 5% discount)');
          
          // Clear the flags
          sessionStorage.removeItem('paymentRedirectInitiated');
          sessionStorage.removeItem('paymentStartTime');
          
          // ✅ CLEAR 5% DISCOUNT when returning from payment provider
          if (onDiscountChange) {
            onDiscountChange(0);
            console.log('🗑️ Cleared 5% discount');
          }
          
          // Close all payment-related popups
          if (showPaymentConfirmation) {
            console.log('❌ Closing payment confirmation popup');
            setShowPaymentConfirmation(false);
            setConfirmationMethod(null);
          }
          
          // Reset payment method back to COD to restore original price (without 5% off)
          if (selectedMethod === 'card' && isCodAvailableForCart) {
            console.log('↩️ Resetting payment method back to COD');
            onMethodSelect('cod', 'Cash on Delivery', CashIcon);
          }
        }
      }
    };
    
    // Check on mount and when payment-related states change
    checkReturnFromPayment();
  }, [selectedMethod, showPaymentConfirmation, onMethodSelect, isCodAvailableForCart, onDiscountChange]);

  const amount = Number(subtotal) || 0;
  const tamaraMinAmount = 99;
  const tamaraMaxAmount = 3000;
  const isTamaraEligible = amount >= tamaraMinAmount && amount <= tamaraMaxAmount;
  const canUseWallet =
  Number(walletBalance || 0) >= amount &&
  amount > 0;

  const installmentAmounts = getInstallmentAmounts(amount);

useEffect(() => {
  console.log('Wallet fetch triggered');
  console.log('User ID used for wallet:', user?.id);
  if (!user?.id) {
    setWalletBalance(0);
    setWalletLoading(false);
    return;
  }
console.log("Fetching wallet for user:", user.id);
  axios
    .get('https://db.store1920.com/wp-json/custom/v3/wallet', {
      params: {
        user_id: user.id // 🔑 SAME AS Wallet.jsx
      }
    })
    .then(res => {
      if (res.data.success) {
        setWalletBalance(Number(res.data.balance || 0));
      } else {
        setWalletBalance(0);
      }
    })
    .catch(() => setWalletBalance(0))
    .finally(() => setWalletLoading(false));

}, [user]);


console.log('Wallet balance:', walletBalance);
console.log('Can use wallet:', canUseWallet);
console.log('Wallet loading:', walletLoading);




  return (
    <div className="pm-wrapper">
      <h3>Payment methods</h3>

      {codRelevantItems.length > 0 && !isCodAvailableForCart && (
        <div
          style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#856404'
          }}
        >
          ℹ️ Cash on Delivery is only available for selected products. Your cart contains items that require online payment.
        </div>
      )}

      <PaymentConfirmationPopup
        isOpen={showPaymentConfirmation}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmationConfirm}
        paymentMethod={confirmationMethod?.id || 'card'}
        subtotal={subtotal}
        discount={0}
        isLoading={isConfirming}
      />

      <div className="payment-methods-list">

        {/* Card Payment */}
        <div className="payment-method-item">
          <input
            type="radio"
            id="card"
            name="payment-method"
            checked={selectedMethod === 'card'}
            onChange={() =>
              handlePaymentMethodSelect('card', 'Credit/Debit Card', CardIcon, {
                selectedSavedCardId: resolvedSelectedSavedCardId,
                selectedSavedCardHint: buildSavedCardHint(selectedSavedCard),
              })
            }
          />
          <label htmlFor="card" className="payment-method-label">
            <div className="payment-method-content">
              <div className="card-payment-header">
                <span className="card-text">Card</span>
                <div className="card-icons-group">
                  <img src={MasterCardIcon} alt="Mastercard" className="card-icon" />
                  <img src={AmexIcon} alt="American Express" className="card-icon" />
                  <img src="https://aimg.kwcdn.com/upload_aimg/temu/ebeb26a5-1ac2-4101-862e-efdbc11544f3.png.slim.png" alt="Discover" className="card-icon" />
                  <img src={ApplePayIcon} alt="Apple Pay" className="card-icon" />
                  <img src={GooglePayIcon} alt="Google Pay" className="card-icon" />
                </div>
              </div>
              {savedCards.length > 0 && (
                <div className="saved-cards-checkout">
                  <div className="saved-cards-checkout-title">Use a saved card</div>
                  <div className="saved-cards-checkout-list">
                    {savedCards.map((card) => {
                      const isSelected = card.id === resolvedSelectedSavedCardId;

                      return (
                        <button
                          key={card.id}
                          type="button"
                          className={`saved-card-chip ${isSelected ? 'selected' : ''}`}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleSavedCardSelect(card);
                          }}
                        >
                          <span className="saved-card-chip-brand">{card.brand}</span>
                          <span className="saved-card-chip-number">•••• {card.last4}</span>
                          <span className="saved-card-chip-expiry">Exp {card.expiry}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="saved-cards-checkout-note">
                    Your selected card will be sent as a saved-card hint to payment. You can still change it on Stripe.
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        <InstallmentOption
          method="tabby"
          icon={TabbyIcon}
          selected={selectedMethod === 'tabby'}
          amount={amount}
          onChange={() => handlePaymentMethodSelect('tabby', 'Tabby', TabbyIcon)}
        />

        {isTamaraEligible ? (
          <InstallmentOption
            method="tamara"
            icon={TamaraIcon}
            selected={selectedMethod === 'tamara'}
            amount={amount}
            onChange={() => handlePaymentMethodSelect('tamara', 'Tamara', TamaraIcon)}
          />
        ) : (
          <div className="payment-method-item payment-method-item--installment disabled">
            <input
              type="radio"
              id="tamara"
              name="payment-method"
              disabled
              checked={false}
              onChange={() => {}}
            />
            <label htmlFor="tamara" className="payment-method-label payment-method-label--installment">
              <div className="temu-pay-block">
                <div className="temu-pay-header">
                  <div className="temu-pay-brand-row">
                    <img src={TamaraIcon} alt="Tamara" className="temu-pay-logo" />
                    <span className="temu-pay-brand-copy">
                      <strong>Tamara:</strong> Split in up to 4 payments
                    </span>
                    <span className="temu-pay-info">?</span>
                  </div>
                </div>
                <div className="temu-pay-unavailable">
                  Tamara is available for orders between AED {tamaraMinAmount} and AED {tamaraMaxAmount}. Your total is AED {amount.toFixed(2)}.
                </div>
              </div>
            </label>
          </div>
        )}

        {/* Cash on Delivery */}
        {isCodAvailableForCart && (
          <div className="payment-method-item">
            <input
              type="radio"
              id="cod"
              name="payment-method"
              checked={selectedMethod === 'cod'}
              onChange={handleCodSelect}
            />
            <label htmlFor="cod" className="payment-method-label">
              <img src={CashIcon} alt="Cash on Delivery" className="payment-icon" />
              <span className="cod-text-container">
                Cash on Delivery
                <div className="cod-info-wrapper">
                  <span
                    className="cod-info-icon"
                    onMouseEnter={() => setShowCodPopup(true)}
                    onMouseLeave={() => setShowCodPopup(false)}
                    onClick={() => setShowCodPopup(!showCodPopup)}
                  >
                    ?
                  </span>
                  {showCodPopup && (
                    <div className="cod-popup">
                      <div className="cod-popup-content">
                        <h4>How to use Cash on Delivery (COD)?</h4>
                        <ol>
                          <li>
                            <strong>Place order using Cash on Delivery</strong>
                            <p>You will receive an order confirmation SMS and email.</p>
                          </li>
                          <li>
                            <strong>Prepare the exact cash amount</strong>
                            <p>Delivery will be between 8am - 11pm within 1-2 working days.</p>
                          </li>
                          <li>
                            <strong>Pay the delivery agent</strong>
                            <p>Please pay the cash amount to our delivery agent.</p>
                          </li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </span>
            </label>
          </div>
          
        )}
        {/* Wallet Payment */}
    {!walletLoading && (

    <div className="payment-method-item" style={{ opacity: canUseWallet ? 1 : 0.5 }}>
    <input
      type="radio"
      id="wallet"
      name="payment-method"
      disabled={!canUseWallet}
      checked={selectedMethod === 'wallet'}
      onChange={() =>
        onMethodSelect('wallet', 'Wallet Balance', { icon: 'wallet' })
      }
    />
    <label htmlFor="wallet" className="payment-method-label">
      <div className="payment-method-content">
        <strong>Wallet Balance</strong>
        <div style={{ fontSize: 13, color: '#555' }}>
          Available: AED {walletBalance}
        </div>

        {!canUseWallet && (
          <div style={{ fontSize: 12, color: '#d9534f' }}>
            Insufficient wallet balance
          </div>
        )}
      </div>
    </label>
  </div>
)}


      </div>
    </div>
  );
};

export default PaymentMethods;
