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
}) => {
  const [showCodPopup, setShowCodPopup] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [confirmationMethod, setConfirmationMethod] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showCodUpsell, setShowCodUpsell] = useState(false);
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
    onMethodSelect(methodId, methodTitle, methodLogo, extra);
  };

  const handleConfirmationClose = () => {
    setShowPaymentConfirmation(false);
    setConfirmationMethod(null);
  };

  // COD upsell: show popup, "PAY NOW" = switch to card, "NO THANKS" = stay on COD
  const handleCodSelect = () => {
    setShowCodUpsell(true);
  };

  const handleCodUpsellPayNow = () => {
    setShowCodUpsell(false);
    // Switch to card payment
    setConfirmationMethod({
      id: 'card',
      title: 'Credit/Debit Card',
      logo: CardIcon,
      extra: {
        selectedSavedCardId: resolvedSelectedSavedCardId,
        selectedSavedCardHint: buildSavedCardHint(selectedSavedCard),
      },
    });
    setShowPaymentConfirmation(true);
  };

  const handleCodUpsellNoThanks = () => {
    setShowCodUpsell(false);
    onMethodSelect('cod', 'Cash on Delivery', CashIcon);
  };

  const handleConfirmationConfirm = () => {
    if (confirmationMethod) {
      onMethodSelect(
        confirmationMethod.id,
        confirmationMethod.title,
        confirmationMethod.logo,
        confirmationMethod.extra || {}
      );
      handleConfirmationClose();
    }
  };

  const handleSavedCardSelect = (card) => {
    const extra = {
      selectedSavedCardId: card.id,
      selectedSavedCardHint: buildSavedCardHint(card),
    };

    if (selectedMethod === 'card') {
      onMethodSelect('card', 'Credit/Debit Card', CardIcon, extra);
      return;
    }

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

  // Check if all non-gift cart items have COD enabled (from WordPress backend setting)
  const allItemsSupportCOD =
    codRelevantItems.length > 0 &&
    codRelevantItems.every(item => item.cod_available === true);

  // COD is available if EITHER:
  // 1. All items are in static products list (existing logic), OR
  // 2. All items have cod_available = true (new WordPress setting)
  const isCodAvailableForCart = 
    (hasOnlyStaticProducts && !hasNonStaticProducts && staticProductIds.length > 0) || 
    allItemsSupportCOD;

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

      {/* COD Upsell Popup */}
      {showCodUpsell && (
        <div className="pcp-overlay" onClick={handleCodUpsellNoThanks}>
          <div className="pcp-modal" onClick={(e) => e.stopPropagation()}>
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
            <div className="pcp-breakdown">
              <div className="pcp-row">
                <span className="pcp-row-label">Original Amount:</span>
                <span className="pcp-row-value pcp-strikethrough">AED {Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="pcp-row">
                <span className="pcp-row-label pcp-green">5% Discount:</span>
                <span className="pcp-row-value pcp-green">- AED {(subtotal * 0.05).toFixed(2)}</span>
              </div>
              <div className="pcp-divider" />
              <div className="pcp-row">
                <span className="pcp-total-label">Pay Now:</span>
                <span className="pcp-total-value pcp-green">AED {(subtotal * 0.95).toFixed(2)}</span>
              </div>
            </div>
            <button className="pcp-pay-btn" onClick={handleCodUpsellPayNow}>
              ⚡ PAY NOW
              <span className="pcp-card-icons">
                <img src={MasterCardIcon} alt="Mastercard" />
                <img src={AmexIcon} alt="Amex" />
              </span>
            </button>
            <button className="pcp-no-thanks" onClick={handleCodUpsellNoThanks}>
              NO, THANKS
            </button>
          </div>
        </div>
      )}

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
